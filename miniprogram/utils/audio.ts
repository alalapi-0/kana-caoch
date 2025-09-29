/**
 * @file 封装微信小程序的录音与播放能力，统一错误处理与兼容性提醒。
 */

export interface RecorderWrapper {
  /** RecorderManager 实例 */
  manager: WechatMiniprogram.RecorderManager;
}

/**
 * 开始录音。
 * @param duration 录音时长上限，单位毫秒，默认 6000。
 * @returns RecorderWrapper 包含 RecorderManager 引用，便于后续停止。
 * @description 调用前需确保已获取录音权限；
 *  - `sampleRate` 设为 16000Hz，兼容多数 ASR；
 *  - `encodeBitRate` 设置为 96kbps，平衡体积与清晰度；
 *  - 若录音失败会由 stopRecord 捕获。
 */
export function startRecord(duration = 6000): RecorderWrapper {
  const manager = wx.getRecorderManager();
  manager.start({
    duration,
    sampleRate: 16000,
    format: 'mp3',
    encodeBitRate: 96000,
    numberOfChannels: 1,
  });
  return { manager };
}

/**
 * 停止录音并获取临时文件路径。
 * @param recorder startRecord 返回的包装对象。
 * @returns Promise<string> 临时音频文件路径。
 * @description 方法内部注册一次性监听器，防止多次回调；若发生错误会 reject 并由调用方提示重试。
 */
export function stopRecord(recorder: RecorderWrapper): Promise<string> {
  return new Promise((resolve, reject) => {
    const manager = recorder.manager;
    const onStop = (res: WechatMiniprogram.OnStopCallbackResult) => {
      manager.offStop(onStop);
      manager.offError(onError);
      resolve(res.tempFilePath);
    };
    const onError = (err: WechatMiniprogram.GeneralCallbackResult) => {
      manager.offStop(onStop);
      manager.offError(onError);
      reject(err);
    };
    manager.onStop(onStop);
    manager.onError(onError);
    manager.stop();
  });
}

/**
 * 播放指定 URL 的音频。
 * @param url 音频链接。
 * @returns WechatMiniprogram.InnerAudioContext 播放上下文，供页面自行销毁。
 * @description 若播放过程中出错会输出日志，调用方可提示用户检查网络；
 *              建议页面在 onUnload 时调用 `destroy` 释放资源。
 */
export function playUrl(url: string): WechatMiniprogram.InnerAudioContext {
  const context = wx.createInnerAudioContext();
  context.src = url;
  context.autoplay = true;
  context.onError((err) => {
    console.error('Audio playback error', err);
    wx.showToast({ title: '播放失败，请检查网络', icon: 'none' });
  });
  context.play();
  return context;
}

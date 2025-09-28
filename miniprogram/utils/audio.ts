interface RecorderWrapper {
  manager: WechatMiniprogram.RecorderManager;
}

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

export function playUrl(url: string): WechatMiniprogram.InnerAudioContext {
  const context = wx.createInnerAudioContext();
  context.src = url;
  context.autoplay = true;
  context.onError((err) => {
    console.error('Audio playback error', err);
  });
  context.play();
  return context;
}

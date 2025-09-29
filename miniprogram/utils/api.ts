/**
 * @file 小程序端 API 封装，负责统一管理与服务端的网络交互。
 */

const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * 获取当前配置的服务端基础地址。
 * @returns string 有效的基础 URL。
 */
function getBaseUrl(): string {
  const app = getApp<{ globalData: { baseUrl?: string } }>();
  return app?.globalData?.baseUrl || DEFAULT_BASE_URL;
}

export interface TtsOptions {
  /** 语音 ID，映射至后端 voiceId */
  voiceId?: number;
  /** 语速参数，与后端保持一致 */
  speed?: number;
}

/**
 * 请求后端生成（或返回）TTS 音频。
 * @param text 待合成的文本。
 * @param options 可选的语速与音色配置。
 * @returns Promise<string> 音频 URL，占位数据用于演示。
 * @example
 * ```ts
 * const url = await tts('おはようございます');
 * ```
 */
export function tts(text: string, options?: TtsOptions): Promise<string> {
  const baseUrl = getBaseUrl();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}/tts`,
      method: 'POST',
      data: {
        text,
        voiceId: options?.voiceId,
        speed: options?.speed,
      },
      timeout: 8000,
      success: (res) => {
        const data = res.data as { url?: string };
        if (res.statusCode === 200 && data.url) {
          resolve(data.url);
        } else {
          reject(new Error('服务端未返回有效音频 URL'));
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

export interface AsrResponse {
  /** 模拟识别文本 */
  text: string;
  /** 归一化得分（0~1） */
  score: number;
  /** 星级结果 */
  stars: number;
  /** 可选置信度 */
  confidence?: number;
}

/**
 * 上传录音文件到后端执行语音识别。
 * @param filePath 小程序本地临时路径。
 * @param target 目标参考文本，用于后端评分。
 * @returns Promise<AsrResponse> 识别结果与得分。
 * @example
 * ```ts
 * const result = await asrRecognize(tempFilePath, 'これはペンです');
 * ```
 */
export function asrRecognize(filePath: string, target: string): Promise<AsrResponse> {
  const baseUrl = getBaseUrl();
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${baseUrl}/asr/recognize`,
      filePath,
      name: 'audio',
      formData: {
        target,
        lang: 'ja-JP',
      },
      timeout: 10000,
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data) as AsrResponse;
            resolve(data);
          } catch (error) {
            reject(new Error('无法解析识别结果，请稍后重试'));
          }
        } else {
          reject(new Error(`识别失败，状态码 ${res.statusCode}`));
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

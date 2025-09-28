const DEFAULT_BASE_URL = 'http://localhost:3000';

function getBaseUrl(): string {
  const app = getApp<{ globalData: { baseUrl?: string } }>();
  return app?.globalData?.baseUrl || DEFAULT_BASE_URL;
}

export function tts(text: string, options?: { voiceId?: number; speed?: number }): Promise<string> {
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
      success: (res) => {
        const data = res.data as { url?: string };
        if (res.statusCode === 200 && data.url) {
          resolve(data.url);
        } else {
          reject(new Error('Failed to fetch TTS audio'));
        }
      },
      fail: reject,
    });
  });
}

export function asrRecognize(filePath: string, target: string): Promise<{
  text: string;
  score: number;
  stars: number;
  confidence?: number;
}> {
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
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('Recognition failed'));
        }
      },
      fail: reject,
    });
  });
}

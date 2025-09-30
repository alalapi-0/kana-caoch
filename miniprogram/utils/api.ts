/**
 * @file 小程序端 API 封装，负责统一管理与服务端的网络交互。
 */

const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * 通用响应结构体，所有后端接口均遵循 { code, message, data } 形式。
 */
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

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
 * @returns Promise<TtsPayload> 音频元信息，占位数据用于演示。
 * @example
 * ```ts
 * const payload = await tts('おはようございます');
 * wx.playBackgroundAudio({ dataUrl: payload.url });
 * ```
 */
export interface TtsPayload {
  /** 占位音频地址 */
  url: string;
  /** 音频时长，毫秒 */
  durationMs: number;
  /** 语速反馈 */
  speed?: number;
  /** 实际采用的音色 ID */
  voiceId?: number;
}

export function tts(text: string, options?: TtsOptions): Promise<TtsPayload> {
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
        const payload = res.data as ApiResponse<TtsPayload | null>;
        if (res.statusCode === 200 && payload?.code === 0 && payload.data?.url) {
          resolve(payload.data);
        } else {
          reject(new Error(payload?.message || '服务端未返回有效音频数据'));
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
  /** 词错误率（0~1），便于结果页展示 */
  wer?: number;
  /** 编辑距离，用于提示错词数量 */
  distance?: number;
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
            const data = JSON.parse(res.data) as ApiResponse<AsrResponse | null>;
            if (data?.code === 0 && data.data) {
              resolve(data.data);
            } else {
              reject(new Error(data?.message || '识别结果异常'));
            }
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

export interface ProgressOverview {
  /** 今日完成度百分比 */
  todayPercent: number;
  /** 本周累计星数 */
  totalStars: number;
  /** 今日完成的测验题数 */
  quizCount: number;
  /** 今日完成的跟读次数 */
  shadowingCount: number;
  /** 连续打卡天数 */
  streak: number;
}

export interface DailyProgressPoint {
  /** 日期，例如 2024-05-01 */
  date: string;
  /** 当日完成的测验次数 */
  quizCount: number;
  /** 当日完成的跟读次数 */
  shadowingCount: number;
  /** 平均星级（0~5） */
  avgStars: number;
}

/**
 * 获取今日概览数据，用于首页进度条与结果页汇总。
 */
export function fetchProgressOverview(): Promise<ProgressOverview> {
  const baseUrl = getBaseUrl();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}/progress`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        const payload = res.data as ApiResponse<ProgressOverview | null>;
        if (res.statusCode === 200 && payload?.code === 0 && payload.data) {
          resolve(payload.data);
        } else {
          reject(new Error(payload?.message || '无法获取进度概览'));
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * 获取近 7 天的趋势数据，供迷你柱状图使用。
 */
export function fetchDailyProgress(): Promise<DailyProgressPoint[]> {
  const baseUrl = getBaseUrl();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}/progress/daily`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        const payload = res.data as ApiResponse<DailyProgressPoint[] | null>;
        if (res.statusCode === 200 && payload?.code === 0 && Array.isArray(payload.data)) {
          resolve(payload.data);
        } else {
          reject(new Error(payload?.message || '无法获取日度进度数据'));
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

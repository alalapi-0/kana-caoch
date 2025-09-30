/**
 * @file 文本转语音路由，当前仅返回固定占位音频地址。
 */

import { Router } from 'express';

import { getMockAudioUrl } from '../services/storage.js';
import { requestTencentTts } from '../services/tencent/tts.js';

const router = Router();

/**
 * 处理前端发起的 TTS 请求。
 * @description
 *  - 当前调用腾讯云占位函数并返回固定 URL，便于小程序播放。
 *  - 未来可将 `requestTencentTts` 替换为真实 API 请求，并把结果写入 COS 后返回 CDN 地址。
 */
router.post('/', async (req, res) => {
  const { text, voiceId, speed } = req.body as {
    text?: string;
    voiceId?: number;
    speed?: number;
  };

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ code: 400, message: 'text 字段必填', data: null });
  }
  if (voiceId !== undefined && typeof voiceId !== 'number') {
    return res.status(400).json({ code: 400, message: 'voiceId 必须为数字', data: null });
  }
  if (speed !== undefined && typeof speed !== 'number') {
    return res.status(400).json({ code: 400, message: 'speed 必须为数字', data: null });
  }

  console.info('[tts-request]', { text, voiceId, speed });

  let url = getMockAudioUrl();
  try {
    const remoteUrl = await requestTencentTts(text, { voiceId, speed, lang: 'ja-JP' });
    if (remoteUrl) {
      url = remoteUrl;
    }
  } catch (error) {
    // Mock 环境下正常忽略错误，未来接入真实服务时可记录到监控系统。
    console.warn('[tts-mock-fallback]', error);
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    code: 0,
    message: 'ok',
    data: {
      url,
      durationMs: 2000,
      voiceId,
      speed,
    },
  });
});

export default router;

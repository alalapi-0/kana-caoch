/**
 * @file 语音识别占位路由，模拟腾讯云 ASR 的打分逻辑。
 */

import { Router } from 'express';
import multer from 'multer';

import { scoreUtterance } from '../lib/score.js';
import { recognizeSpeech } from '../services/tencent/asr.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * 处理音频上传并返回 mock 识别结果。
 * @description
 *  - 当前不会持久化音频，仅在内存中读取 Buffer。
 *  - 调用占位的 `recognizeSpeech`，得到轻度扰动的文本，随后使用评分函数计算 WER 与星级。
 *  - 错误场景返回 500，前端需提示用户重试或检查网络。
 */
router.post('/recognize', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'audio file is required' });
  }

  try {
    const target = typeof req.body.target === 'string' ? req.body.target : '';
    const lang = typeof req.body.lang === 'string' ? req.body.lang : 'ja-JP';

    const recognition = await recognizeSpeech(req.file.buffer, { lang, targetText: target });
    const recognizedText = recognition.text;
    const { wer, stars, score } = scoreUtterance(target || recognizedText, recognizedText);

    res.json({
      text: recognizedText,
      confidence: recognition.confidence,
      score,
      stars,
      wer,
      target,
    });
  } catch (error) {
    console.error('[asr-error]', error);
    res.status(500).json({ message: 'recognition failed' });
  }
});

export default router;

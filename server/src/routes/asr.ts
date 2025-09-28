import { Router } from 'express';
import multer from 'multer';

import { scoreUtterance } from '../lib/score.js';
import { recognizeSpeech } from '../services/tencent/asr.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/recognize', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'audio file is required' });
  }

  try {
    const target = typeof req.body.target === 'string' ? req.body.target : '';
    const lang = typeof req.body.lang === 'string' ? req.body.lang : 'ja-JP';

    const recognition = await recognizeSpeech(req.file.buffer, { lang });
    const recognizedText = target || recognition.text;
    const { wer, stars, score } = scoreUtterance(target, recognizedText);

    res.json({
      text: recognizedText,
      confidence: recognition.confidence,
      score,
      stars,
      wer,
      target,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'recognition failed' });
  }
});

export default router;

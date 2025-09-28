import { Router } from 'express';

import { getMockAudioUrl } from '../services/storage.js';

const router = Router();

router.post('/', (req, res) => {
  const { text, voiceId, speed } = req.body as {
    text?: string;
    voiceId?: number;
    speed?: number;
  };

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'text is required' });
  }

  // Placeholder: real implementation should call Tencent Cloud TTS.
  const url = getMockAudioUrl();
  res.json({ url, durationMs: 2000, voiceId, speed });
});

export default router;

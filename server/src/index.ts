import express from 'express';
import cors from 'cors';

import ttsRouter from './routes/tts.js';
import asrRouter from './routes/asr.js';
import progressRouter from './routes/progress.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/tts', ttsRouter);
app.use('/asr', asrRouter);
app.use('/progress', progressRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Kana Coach server listening on port ${port}`);
});

export default app;

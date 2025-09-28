import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, data: [] });
});

router.post('/', (req, res) => {
  const payload = req.body ?? {};
  res.json({ ok: true, received: payload });
});

export default router;

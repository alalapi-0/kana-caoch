/**
 * @file 学习进度占位路由，当前仅回显请求体，方便联调。
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /progress
 * @returns { ok: true } 以及空数组，未来可替换为真实进度列表。
 */
router.get('/', (_req, res) => {
  res.json({ ok: true, data: [] });
});

/**
 * POST /progress
 * @description 占位写入接口，目前直接回显客户端上传的数据，提示未来将写入数据库或对象存储。
 */
router.post('/', (req, res) => {
  const payload = req.body ?? {};
  res.json({ ok: true, received: payload });
});

export default router;

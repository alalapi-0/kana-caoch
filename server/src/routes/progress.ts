/**
 * @file 学习进度路由：提供概览数据、日度统计以及占位写入接口。
 */

import { Router } from 'express';
import type { Response } from 'express';

const router = Router();

interface ProgressOverview {
  todayPercent: number;
  totalStars: number;
  quizCount: number;
  shadowingCount: number;
  streak: number;
}

interface DailyProgressItem {
  date: string;
  quizCount: number;
  shadowingCount: number;
  avgStars: number;
}

function sendJson<T>(res: Response, data: T, message = 'ok', code = 0) {
  /**
   * @description 统一响应结构并设置缓存策略。
   * Mock 环境下默认 no-store，真实环境可根据业务调整（例如 5 分钟缓存）。
   */
  res.setHeader('Cache-Control', 'no-store');
  res.json({ code, message, data });
}

/**
 * GET /progress
 * @description 返回今日整体概览，便于前端渲染进度条与统计卡片。
 */
router.get('/', (_req, res) => {
  const overview: ProgressOverview = {
    todayPercent: 68,
    totalStars: 18,
    quizCount: 6,
    shadowingCount: 3,
    streak: 4,
  };
  sendJson(res, overview);
});

/**
 * GET /progress/daily
 * @description 返回近 7 天的测验与跟读次数以及平均星级，供前端绘制小型图表。
 */
router.get('/daily', (_req, res) => {
  const today = new Date();
  const daily: DailyProgressItem[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date: date.toISOString().slice(0, 10),
      quizCount: Math.floor(Math.random() * 5) + 1,
      shadowingCount: Math.floor(Math.random() * 3) + 1,
      avgStars: Number((Math.random() * 2 + 3).toFixed(1)),
    };
  });
  sendJson(res, daily);
});

/**
 * POST /progress
 * @description 占位写入接口，校验基础字段后回显，提示前端提交成功。
 */
router.post('/', (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return sendJson(res, null, '请求体必须为对象', 400);
  }
  const { type, score } = payload as { type?: string; score?: number };
  if (type && typeof type !== 'string') {
    return sendJson(res, null, 'type 必须为字符串', 400);
  }
  if (score !== undefined && typeof score !== 'number') {
    return sendJson(res, null, 'score 必须为数字', 400);
  }
  sendJson(res, { stored: true, echo: payload });
});

export default router;

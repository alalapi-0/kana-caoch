/**
 * @file Express 应用入口，负责初始化中间件并挂载业务路由。
 */

import express from 'express';
import cors from 'cors';

import ttsRouter from './routes/tts.js';
import asrRouter from './routes/asr.js';
import progressRouter from './routes/progress.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

// 启用跨域，便于本地小程序或网页调试；生产环境需限制来源域名。
app.use(cors());
// 解析 JSON 与表单请求，确保路由可以直接读取请求体。
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册业务路由模块。
app.use('/tts', ttsRouter);
app.use('/asr', asrRouter);
app.use('/progress', progressRouter);

// 健康检查端点，方便监控与容器编排探活。
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  // 在终端打印启动信息，便于快速确认端口及环境变量配置是否正确。
  console.log(`Kana Coach server listening on port ${port}`);
});

export default app;

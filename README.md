# Kana Coach · 微信小程序 + Node/Express Mock 服务

## 项目简介
Kana Coach 是一个针对日语学习者的最小可行产品（MVP），由微信小程序前端与 Node/Express 模拟服务端组成。当前版本聚焦两个核心练习场景：

- **五十音测验**：本地根据编辑距离计算准确率与星级，帮助巩固假名与罗马音。
- **跟读训练**：调用 Mock TTS 接口获取占位音频、录音上传至 Mock ASR 接口，并基于词错误率（WER）返回评分与星级。

> **路线图预告**：后续将逐步接入腾讯云 TTS/ASR/COS，扩充词库与例句，完善进度存储与用户体系。

## 功能清单
- ✅ 首页卡片入口，串联测验与跟读训练。
- ✅ 五十音测验：随机抽题、本地评分、星级组件即时反馈。
- ✅ 跟读训练：示例播放、录音上传、Mock 识别结果展示。
- ✅ 结果页：聚合测验与跟读成绩，可重新进入练习。
- ✅ 设置页：占位语速/播音人选项，并允许配置后端 BASE_URL。
- ✅ 服务端：`/tts`、`/asr/recognize`、`/progress` 路由；评分算法与单元测试。
- 🔜 计划增强：腾讯云能力对接、用户登录、数据持久化、更多题型。

## 目录结构
```
kana-coach/
├─ README.md                     # 使用指南与开发文档
├─ package.json                  # 根工作区脚本（bootstrap/dev/test）
├─ pnpm-workspace.yaml           # pnpm 工作区定义
├─ .editorconfig                 # 跨编辑器统一格式
├─ .prettierrc                   # Prettier 规则
├─ .eslintrc.cjs                 # ESLint 配置
├─ .gitignore                    # 忽略依赖、二进制及工具缓存
├─ .gitattributes                # 文本归一化与二进制保护
├─ shared/                       # 前后端共享数据（纯文本）
│  ├─ kana.json                  # 假名与罗马音样本（10 条）
│  └─ sentences.json             # 日语例句（5 条）
├─ miniprogram/                  # 微信小程序（TypeScript）
│  ├─ project.config.json        # 微信开发者工具配置
│  ├─ tsconfig.json              # 小程序 TS 编译配置
│  ├─ app.(ts/json/wxss)         # 全局入口与样式
│  ├─ utils/                     # API、录音、评分工具
│  ├─ components/star-rating/    # 星级展示组件
│  └─ pages/                     # home/kana-quiz/shadowing/result/settings
└─ server/                       # Node/Express Mock 服务端（TypeScript）
   ├─ package.json               # 服务端依赖与脚本
   ├─ tsconfig.json              # 服务端 TS 编译配置
   ├─ .env.example               # 环境变量示例
   └─ src/
      ├─ index.ts                # Express 启动入口
      ├─ routes/                 # tts/asr/progress 路由
      ├─ services/               # 腾讯云占位服务、存储工具
      ├─ lib/score.ts            # 评分算法（Levenshtein/WER/星级）
      └─ tests/score.test.ts     # Vitest 单元测试
```

## 环境要求
- Node.js ≥ 18（建议 LTS 版本）
- [pnpm](https://pnpm.io/) ≥ 8
- 微信开发者工具 ≥ 1.06.2405150（支持 TypeScript 项目导入）
- （可选）Vitest CLI，用于运行后端单测

## 安装与启动
```bash
pnpm -w install        # 安装工作区所有依赖
pnpm dev:server        # 在 3000 端口启动 Express Mock 服务
```
> 首次执行 `pnpm -w install` 会安装 miniprogram 与 server 子包依赖；请确保已开启外网代理或使用离线镜像。

## 在微信开发者工具中导入小程序
1. 打开微信开发者工具，选择 **导入项目**。
2. 项目目录选择仓库内的 `miniprogram/` 文件夹。
3. AppID 建议使用「测试号」或留空游客模式（工具会提示仅供调试）。
4. **编译设置**：开启「使用 npm 模块」无需安装额外依赖；如需 ES6 转 ES5 可保持默认。
5. 若需联调服务端，在工具的「本地设置」中勾选「不校验合法域名」。

## 启动前后端联调流程
1. 终端执行 `pnpm dev:server`，确认日志输出 `Kana Coach server listening on port 3000`。
2. 在小程序设置页「后端地址」中填写 `http://localhost:3000` 并保存。
3. 进入「跟读训练」页面：
   - 点击「播放示例」，前端会调用 `/tts` 并播放占位音频。
   - 点击「开始录音」，完成后自动上传 `/asr/recognize`，展示 Mock 识别文本、得分与星级。
4. 进入「五十音测验」页面：
   - 输入罗马音并提交，基于编辑距离计算准确率与星级。
   - 点击「查看历史」跳转结果页，可查看最近一次测验与跟读成绩。

> 图示占位：请在本地联调后自行截取「首页」「测验」「跟读」页面截图插入文档（此处不附带真实图片，避免提交二进制文件）。

## 测试命令与预期输出
服务端集成 Vitest 单元测试，覆盖编辑距离、WER 与星级映射。

```bash
pnpm test
```

典型输出示例（文本）
```
> pnpm -C server test

 DEV  v1.5.0 /workspace/kana-caoch/server
 ✓ score utilities (4)  12ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  15:42:01
   Duration  800ms
```
若新增算法或阈值，请同时在 `server/src/tests/score.test.ts` 编写对应断言并运行上述命令。

## `.gitignore` 与 `.gitattributes`
- `.gitignore` 明确排除 `node_modules/`、构建产物、微信开发者工具缓存以及常见音视频/压缩包/可执行文件，确保仓库保持纯文本。
- `.gitattributes` 开启 `text=auto`，并将所有常见二进制后缀标记为 `-text`，防止 Git 误判编码及提交。

## 代码风格与提交规范
- 统一使用 Prettier（`printWidth=100`、单引号、保留分号）。
- TypeScript 强制开启 `strict`，导出函数需包含 JSDoc 中文注释。
- Commit Message 建议遵循 `type(scope): summary`（例如 `feat(server): add tts route mock`）。
- 推荐分支策略：`main` 用于稳定版本，功能开发在 `feature/*` 分支完成并通过 PR 合并。

## 常见问题 FAQ
1. **小程序录音失败**：首次录音需在预览器或真机授权，若授权弹窗被忽略，可在设置中重新开启麦克风权限。
2. **iOS 录音时长受限**：iOS 对后台录音有严格限制，建议保持界面常亮，并控制 10 秒内完成练习。
3. **Mock 服务跨域问题**：已在 Express 层启用 `cors`，若仍提示网络错误，请确认开发者工具「不校验合法域名」已勾选。
4. **端口冲突**：默认使用 `3000` 端口，可在 `.env` 或启动命令中设置 `PORT=xxxx pnpm dev:server`。
5. **弱网或离线**：TTS/ASR 都是 Mock，离线情况下按钮会提示失败，可在 README 的联调步骤中查看重试策略。

## 腾讯云 TTS / ASR / COS 对接指引
### 准备工作
1. 在腾讯云开通 **语音合成 TTS**、**语音识别 ASR**、**对象存储 COS**。
2. 创建最小权限的 CAM 子账号，获取 `SecretId` 与 `SecretKey`，存放于服务器环境变量。
3. 若需客户端直传 COS，需启用临时密钥（STS）并实现签名服务。

### TTS 接入伪代码
```ts
import tencentcloud from 'tencentcloud-sdk-nodejs-tts';

const client = new tencentcloud.tts.v20190823.Client({
  credential: { secretId: process.env.TENCENT_SECRET_ID!, secretKey: process.env.TENCENT_SECRET_KEY! },
  region: 'ap-hongkong',
});

async function realTts(text: string) {
  const params = { Text: text, SessionId: crypto.randomUUID(), VoiceType: 1017 };
  const res = await client.TextToVoice(params);
  await cos.putObject({ Key: `tts/${params.SessionId}.mp3`, Body: Buffer.from(res.Audio, 'base64') });
  return `https://your-cdn/tts/${params.SessionId}.mp3`;
}
```
- 建议启用 CDN + 鉴权查询参数，音频有效期应与练习场景匹配。

### ASR 接入伪代码
```ts
import tencentcloud from 'tencentcloud-sdk-nodejs-asr';

const client = new tencentcloud.asr.v20190614.Client({
  credential: { secretId: process.env.TENCENT_SECRET_ID!, secretKey: process.env.TENCENT_SECRET_KEY! },
  region: 'ap-hongkong',
});

async function realAsr(buffer: Buffer) {
  const res = await client.SentenceRecognition({
    EngSerViceType: '16k_zh',
    SourceType: 1,
    VoiceFormat: 'mp3',
    Data: buffer.toString('base64'),
  });
  return res.Result?.Text ?? '';
}
```
- 若音频较大可使用流式识别（WebSocket）或 COS URL 模式。
- 注意请求频率限制，建议实现队列或熔断策略。

### COS 上传与回源
```ts
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({ SecretId: process.env.TENCENT_SECRET_ID!, SecretKey: process.env.TENCENT_SECRET_KEY! });

async function uploadAudio(key: string, data: Buffer) {
  await cos.putObject({ Bucket: process.env.COS_BUCKET!, Region: process.env.COS_REGION!, Key: key, Body: data });
  return `https://${process.env.COS_BUCKET!}.cos.${process.env.COS_REGION!}.myqcloud.com/${key}`;
}
```
- 建议结合 CDN、自定义域名和防盗链策略。
- 对敏感音频启用生命周期管理，定期清理。

## 部署与安全建议
- 使用 `.env` 管理密钥，切勿将敏感信息写入代码库。
- 生产环境中仅开放必要端口，配合 WAF/速率限制防止滥用。
- 对访问日志做脱敏处理，遵守所在地隐私法规。
- 建议启用 HTTPS 与 HSTS，防止中间人攻击。

## 无障碍与可用性建议
- 星级组件已添加 `aria-label`，便于屏幕阅读器朗读评分。
- 对录音、播放失败的场景提供 `wx.showToast` 提示，弱网时引导重试。
- 页面按钮尺寸 ≥44px，保证触控可达性；表单控件支持键盘导航。
- 可根据需要新增离线缓存策略，例如将例句数据写入 Storage。

## 免责声明
本项目仅用于教学与演示，所有音频与识别结果均为占位 Mock 数据。实际业务接入腾讯云或其他云服务时，请遵循相关法律法规，妥善处理用户隐私与著作权问题。


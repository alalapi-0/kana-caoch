# Kana Coach · 微信小程序 + Node/Express Mock 服务

## 项目简介
Kana Coach 是一个针对日语学习者的最小可行产品（MVP），由微信小程序前端与 Node/Express 模拟服务端组成。当前版本聚焦两个核心练习场景：

- **五十音测验**：本地根据编辑距离计算准确率与星级，帮助巩固假名与罗马音。
- **跟读训练**：调用 Mock TTS 接口获取占位音频、录音上传至 Mock ASR 接口，并基于词错误率（WER）返回评分与星级。

> **路线图预告**：后续将逐步接入腾讯云 TTS/ASR/COS，扩充词库与例句，完善进度存储与用户体系。

## 本迭代内容概览
- ✅ 接入 [@vant/weapp](https://youzan.github.io/vant-weapp/) 组件库，实现卡片化布局、按钮、表单、进度条、评分等 UI 能力。
- ✅ 首页/结果页新增迷你柱状图（Canvas 原生绘制）及进度卡片，强化数据可视化反馈。
- ✅ 五十音测验/跟读训练全面升级表单校验、星级展示、进度提示，并与 Vant Toast 结合提供即时反馈。
- ✅ 服务端统一 { code, message, data } 响应结构，新增 `/progress/daily` Mock 数据，便于驱动前端可视化。
- ✅ README 强化：补充环境准备清单、npm 构建说明、联调验收列表、主题定制指引与安全实践。

## 你需要准备/提供的内容
- 微信小程序 **AppID**：用于微信开发者工具预览与真机调试。
- 腾讯云文本转语音（TTS）密钥：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`。
- 腾讯云语音识别（ASR）密钥：`TENCENT_ASR_*`（含 SecretId/SecretKey/应用 ID 等）。
- 腾讯云对象存储（COS）桶配置：`COS_BUCKET`、`COS_REGION`。
- （可选）自托管服务端：一台可外网访问的测试机以及基础防护配置。

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

## 安装与构建
### 后端 / 工作区依赖安装
```bash
pnpm -w install        # 一次性安装 miniprogram 与 server 子包依赖
pnpm dev:server        # 在 3000 端口启动 Express Mock 服务
```
> 提示：首次安装可能需要科学上网或使用公司 npm 镜像，确保 `@vant/weapp` 能正确下载。

### 微信开发者工具导入与 npm 构建
1. 打开微信开发者工具，选择 **导入项目**，目录指向仓库内的 `miniprogram/`。
2. AppID 可填写测试号或暂时留空（仅限本地调试）。
3. 在项目设置中勾选 **使用 npm 模块**，并保持基础库版本 ≥ 2.27。
4. 依次点击 **工具 → 构建 npm**，待终端显示构建成功后重新编译项目。
5. 若需联调本地服务端，请在「详情 → 本地设置」中勾选「不校验合法域名」。

### 常见报错排查
- **npm 构建失败**：确认已执行 `pnpm -w install`，删除 `miniprogram/node_modules` 后重新构建。
- **提示未开启 npm 支持**：在项目设置勾选「使用 npm 模块」后再次构建。
- **基础库版本过低**：升级到最新稳定版基础库以启用 Canvas 2D 与 Vant 组件。
- **上传大小限制**：Mock 服务器仅返回文本，不会膨胀包体；如需上传资源，请在发布前清理无关依赖。
- **端口/网络不通**：确认终端 `pnpm dev:server` 正常运行，并在微信开发者工具放行 `http://localhost:3000`。

## 联调与可视化验收清单
1. `pnpm dev:server` 启动后，在日志中确认 Mock 服务正在监听 3000 端口，并可访问 `GET /progress/daily` 返回近 7 天数据。
2. 首页（Home）应展示：
   - Vant Grid 卡片入口（五十音测验、跟读训练）。
   - 「今日进度」卡片含进度条、测验/跟读统计、累计星数。
   - `mini-bars` 组件渲染 7 日练习次数与平均星级走势。
3. 五十音测验（Kana Quiz）：
   - Field 校验空值/非法字符，Toast 给出错误提示。
   - 提交题目后，进度条更新，结果列表显示准确率、编辑距离与星级。
4. 跟读训练（Shadowing）：
   - 「播放示例」按钮触发 TTS，录音按钮在录制时显示 Loading。
   - 上传成功后，以 Toast 提示并展示识别文本、WER、Progress、星级与目标文本。
5. 结果页（Result）：
   - 汇总显示总星数、平均准确率、跟读得分、错词列表。
   - 嵌入 `mini-bars` 组件查看趋势，并提供「再次练习」「返回首页」按钮。
6. 设置页（Settings）：
   - Vant Form 提供播音人、语速、自动播放、Mock 服务地址配置。
   - 保存后触发 Toast，`autoPlay` 状态在跟读页生效。

## UI 主题与可定制
- **色板与主色调**：
  - 修改 `miniprogram/app.wxss` 及各页面 `.wxss` 中的渐变色、阴影，即可快速切换主题色。
  - 若需统一调整 Vant 组件主题，可参考官方文档通过 `theme-vars` 自定义（例如在 `app.wxss` 中覆写 `--button-primary-background` 等变量）。
- **圆角与按钮尺寸**：在页面样式中集中定义 `border-radius`、`padding`，并为 Vant Button 追加自定义类，即可保持一致的圆角/高度风格。
- **字体与留白**：结合 `rem/rpx` 变量为不同模块设定字号与间距，必要时可在 `app.wxss` 提供全局 `font-family`。
- **脱离 Vant 的降级方案**：
  1. 将 `pages/*/index.json` 中的 `usingComponents` 清除。
  2. 使用原生组件（`button`、`form`、`input`、`progress` 等）替换 Vant 组件，并在对应 `.wxss` 中还原当前样式。
  3. `components/star-rating` 已作为适配层存在，若后续切换 UI 库只需调整该组件内部实现。
  4. `mini-bars` 为纯自研 Canvas 组件，不依赖 Vant，可直接复用。

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

## 二进制/媒体文件的提交约束
- 禁止将 `.mp3`、`.wav`、`.png`、`.jpg`、`.gif`、`.pdf`、压缩包及可执行文件提交至仓库，Mock 数据一律使用纯文本或字符串常量。
- `.gitignore` 已排除 `node_modules/`、构建产物与微信开发者工具缓存，如需新增忽略项请在同一文件维护。
- `.gitattributes` 通过 `text=auto` 与常见二进制后缀 `-text` 设置，确保换行符与编码一致，提交前可执行 `git check-attr` 验证。
- 若需引用图标，请使用 Unicode 字符或内联 SVG 字符串，并在代码注释中标注来源与许可信息。

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

## 可视化组件说明
- **组件位置**：`miniprogram/components/mini-bars/`，以原生 Canvas 2D 绘制，无第三方依赖。
- **输入参数**：
  - `stats`: `Array<{ label: string; value: number; secondary?: number }>`，`value` 代表练习次数，`secondary` 代表平均星级。
  - `loading`: `boolean`，为 `true` 时暂停绘制并显示占位文案。
  - `title`: `string`，用于自定义卡片标题。
- **渲染细节**：组件在 `ready` 生命周期中获取节点，结合设备像素比缩放 Canvas，使用柱状图 + 折线标记展示练习与星级趋势。
- **坐标系与适配**：内部以上下 28px、左右 16px 作为留白，根据数据量动态计算柱宽和间距；半透明填充避免视觉拥挤。
- **低端机优化建议**：
  - 避免一次性传入超过 14 天的数据，保持图表元素可控。
  - 在频繁切换数据时优先复用已有 Canvas，必要时可在调用方做节流。

## 未来接入云资源的步骤与安全建议
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

### 安全建议
- 使用 `.env` 管理密钥，切勿将敏感信息写入代码库。
- 生产环境中仅开放必要端口，结合 WAF、速率限制与熔断策略防止滥用。
- 对访问日志、录音文件做脱敏处理，遵守所在地隐私法规与数据保留政策。
- TTS/ASR 调用建议通过后端代理签名，限制子账号权限并定期轮换密钥。
- 建议启用 HTTPS 与 HSTS，防止中间人攻击；上传至 COS 的音频可结合临时密钥与生命周期策略。

## 无障碍与可用性建议
- 星级组件已添加 `aria-label`，便于屏幕阅读器朗读评分。
- 对录音、播放失败的场景提供 `wx.showToast` 提示，弱网时引导重试。
- 页面按钮尺寸 ≥44px，保证触控可达性；表单控件支持键盘导航。
- 可根据需要新增离线缓存策略，例如将例句数据写入 Storage。

## 免责声明
本项目仅用于教学与演示，所有音频与识别结果均为占位 Mock 数据。实际业务接入腾讯云或其他云服务时，请遵循相关法律法规，妥善处理用户隐私与著作权问题。


# Kana Coach

Kana Coach 是一个用于日语学习的微信小程序 + Node.js 模拟服务端的单仓（monorepo）。它提供五十音罗马音练习与例句跟读评分的基础能力，前端与后端共享同一份假名与例句元数据，方便后续统一扩展。当前版本以内置的 mock 能力为主，确保可以在本地快速运行与预览完整流程。

## 环境要求

- Node.js 18+
- [pnpm](https://pnpm.io/) 8+
- 微信开发者工具（用于预览 `miniprogram/`）

## 安装与启动

```bash
pnpm -w install
pnpm dev:server
```

1. 在终端执行上述命令安装依赖并启动本地 mock 服务（默认端口 3000）。
2. 打开微信开发者工具，选择“导入项目”，项目目录指向仓库中的 `miniprogram/`。
3. 首次导入时，可在 `miniprogram/project.config.json` 中将 `appid` 替换为自己的测试号或留空使用游客模式。

## 目录结构

```
kana-coach/
├─ miniprogram/        # 微信小程序（TypeScript）
├─ server/             # Node + Express mock 服务端（TypeScript）
├─ shared/             # 前后端共用的假名和例句数据
├─ package.json        # workspace 管理脚本
└─ pnpm-workspace.yaml # pnpm 工作区配置
```

### 关键功能

- **小程序端**
  - 首页提供五十音测验与跟读训练入口。
  - 五十音测验从共享数据中抽取题目，根据编辑距离生成星级。
  - 跟读训练可请求 TTS mock 音频、录音上传并展示返回的识别结果与星级。
  - 结果页集中展示测验与跟读的成绩，设置页提供语速与播音人占位选项。

- **服务端**
  - `POST /tts`：返回固定的 mock 音频 URL。
  - `POST /asr/recognize`：接收上传音频，返回模拟识别文本、得分与星级。
  - `GET/POST /progress`：占位接口，方便后续接入学习进度存储。
  - `lib/score.ts`：实现编辑距离、WER 与星级映射，Vitest 覆盖核心逻辑。

## 后续对接计划

- 接入腾讯云 TTS/ASR 与 COS 对象存储，替换当前的 mock 响应。
- 丰富五十音与例句数据集，增加自适应练习逻辑。
- 细化评分模型，引入更完整的语音评测指标与可视化反馈。

欢迎在此基础上继续扩展功能或接入真实云服务。

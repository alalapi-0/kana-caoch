/**
 * @file 腾讯云 TTS 占位服务，当前项目仅返回本地 mock URL。
 * TODO：如何接入腾讯云（所需环境变量、签名、接口示例）：
 * 1. 在腾讯云控制台开通语音合成服务，创建 API 密钥（SecretId/SecretKey）。
 * 2. 在环境变量中注入 `TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`TENCENT_TTS_APPID` 等配置，避免写死在代码里。
 * 3. 真实接入时需使用腾讯云 TTS REST API：对请求体进行 HMAC-SHA1/SHA256 签名，携带时间戳与随机数防重放；
 *    参考官方示例生成 Authorization 头，再通过 HTTPS 请求 `https://tts.tencentcloudapi.com`。
 * 4. 为降低延迟与成本，可在生成语音后将音频写入对象存储（例如腾讯云 COS），并缓存 URL；设置有效期、防盗链参数。
 * 5. 需注意敏感信息脱敏与最小权限原则：Server 端请求腾讯云，前端仅拿到安全的临时 URL。
 */

export interface TencentTtsOptions {
  /** 选填：目标语速，腾讯云支持 -2~2 的浮点数 */
  speed?: number;
  /** 选填：音色 ID，需参考腾讯云 TTS 文档中的 VoiceType */
  voiceId?: number;
  /** 选填：语言参数，例如 ja-JP、zh-CN */
  lang?: string;
}

/**
 * 模拟调用腾讯云 TTS，返回一个可供前端测试的占位地址。
 * @param text 待合成文本。
 * @param options 语速、音色等可选参数，当前仅用于日志说明。
 * @returns Promise<string> 恒定返回一个示例 URL，真实环境下应返回 COS 或 CDN 地址。
 * @example
 * ```ts
 * const url = await requestTencentTts('こんにちは');
 * console.log(url); // https://example.com/mock-tts.mp3
 * ```
 */
export async function requestTencentTts(text: string, options: TencentTtsOptions = {}): Promise<string> {
  // 此处保留日志方便调试，真实环境需要接入腾讯云 SDK。
  console.info('[mock-tencent-tts]', text, options);
  // 返回固定的示例 URL，用于演示播放逻辑。
  return 'https://example.com/mock-tts.mp3';
}

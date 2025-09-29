/**
 * @file 腾讯云 ASR 占位服务，用于说明未来如何接入真实语音识别。
 * TODO：如何接入腾讯云（所需环境变量、签名、接口示例）：
 * 1. 开通腾讯云语音识别（短语音、一句话识别或实时流式），获取 SecretId/SecretKey。
 * 2. 服务端配置环境变量 `TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`TENCENT_ASR_APPID`，并视业务需要引入临时密钥机制。
 * 3. 调用时需对请求参数进行 TC3-HMAC-SHA256 签名，构造 HTTPS 请求到 `https://asr.tencentcloudapi.com`，指定引擎类型、语言等参数。
 * 4. 大文件建议先上传至 COS 或使用 WebSocket/流式接口，返回的音频 URL 需带鉴权防盗链。
 * 5. 注意存储与日志合规：仅保留必要的音频与转写文本，做好脱敏与访问控制。
 */

export interface TencentAsrOptions {
  /** 目标语言，示例：`ja-JP` */
  lang?: string;
  /** 预期的目标文本，便于对齐评分 */
  targetText?: string;
}

export interface TencentAsrResult {
  /** 模拟识别文本 */
  text: string;
  /** 模拟置信度，0~1 */
  confidence: number;
}

/**
 * 模拟调用腾讯云 ASR，当前仅返回目标文本的简单扰动字符串。
 * @param _audioBuffer 上传的音频内容，本地 mock 环节并不会真正使用。
 * @param options 语言代码与目标文本，目标文本用于生成 mock 结果。
 * @returns Promise<TencentAsrResult> 固定结构的识别结果。
 * @example
 * ```ts
 * const result = await recognizeSpeech(Buffer.from(''), { targetText: 'おはよう' });
 * console.log(result.text);
 * ```
 */
export async function recognizeSpeech(
  _audioBuffer: Buffer,
  options: TencentAsrOptions
): Promise<TencentAsrResult> {
  const base = options.targetText ?? 'こんにちは 世界';
  // 轻度扰动：替换最后一个字符，突出评分逻辑的演示效果。
  const mutated = base.replace(/.$/, (char) => (char === '。' ? '!' : `${char}~`));
  return {
    text: mutated,
    confidence: 0.6,
  };
}

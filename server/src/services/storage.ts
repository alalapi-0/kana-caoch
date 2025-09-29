/**
 * @file 存储相关工具，当前仅返回占位音频地址，未来可对接腾讯云 COS 等对象存储。
 */

/**
 * 获取一个可供前端播放的占位音频 URL。
 * @returns string Mock 音频链接，真实环境应替换为具备鉴权的 CDN/COS 链接。
 * @example
 * ```ts
 * const url = getMockAudioUrl();
 * console.log(url); // https://example.com/mock.mp3
 * ```
 */
export function getMockAudioUrl(): string {
  // TODO: 后续接入 COS 时，可根据用户 ID/任务 ID 生成唯一的存储键，并设置有效期与缓存策略。
  return 'https://example.com/mock.mp3';
}

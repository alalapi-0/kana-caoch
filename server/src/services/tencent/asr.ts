// TODO: 接入腾讯云 ASR
export async function recognizeSpeech(_buffer: Buffer, _options?: { lang?: string }) {
  return {
    text: 'mock recognized text',
    confidence: 0.85,
  };
}

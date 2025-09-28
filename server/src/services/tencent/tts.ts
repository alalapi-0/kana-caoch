// TODO: 接入腾讯云 TTS
export async function synthesizeSpeech(_text: string, _options?: { voiceId?: number; speed?: number }) {
  return {
    url: 'https://example.com/mock.mp3',
    durationMs: 2000,
  };
}

import { tts, asrRecognize } from '../../utils/api';
import { startRecord, stopRecord, playUrl } from '../../utils/audio';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sentences: { jp: string; romaji: string; hint: string }[] = require('../../../shared/sentences.json');

Page({
  data: {
    currentIndex: 0,
    currentSentence: sentences[0],
    loadingTts: false,
    recording: false,
    result: null as null | { text: string; score: number; stars: number; confidence?: number },
    hintVisible: false,
  },
  recorderWrapper: null as null | ReturnType<typeof startRecord>,
  audioContext: null as WechatMiniprogram.InnerAudioContext | null,
  onUnload() {
    this.audioContext?.destroy?.();
    this.audioContext = null;
  },
  toggleHint() {
    this.setData({ hintVisible: !this.data.hintVisible });
  },
  play() {
    const sentence = this.data.currentSentence;
    if (!sentence) return;
    this.setData({ loadingTts: true });
    tts(sentence.jp)
      .then((url) => {
        this.audioContext?.destroy?.();
        this.audioContext = playUrl(url);
      })
      .catch((err) => {
        console.error(err);
        wx.showToast({ title: '播放失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loadingTts: false });
      });
  },
  startRecording() {
    if (this.data.recording) return;
    this.recorderWrapper = startRecord(8000);
    this.setData({ recording: true });
    wx.showToast({ title: '开始录音', icon: 'none' });
    setTimeout(() => {
      if (this.data.recording) {
        this.stopRecording();
      }
    }, 8200);
  },
  stopRecording() {
    if (!this.recorderWrapper) return;
    stopRecord(this.recorderWrapper)
      .then((filePath) => {
        this.setData({ recording: false });
        this.recorderWrapper = null;
        const sentence = this.data.currentSentence;
        if (!sentence) return;
        return asrRecognize(filePath, sentence.jp).then((res) => {
          this.setData({ result: res });
          const app = getApp<{ globalData: Record<string, unknown> }>();
          app.globalData.shadowingResult = res;
        });
      })
      .catch((err) => {
        console.error(err);
        this.setData({ recording: false });
        this.recorderWrapper = null;
        wx.showToast({ title: '录音失败', icon: 'none' });
      });
  },
  toResult() {
    wx.navigateTo({ url: '/pages/result/index?type=shadowing' });
  },
});

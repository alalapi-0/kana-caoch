/**
 * @file 跟读训练页面，提供播放示例音频与录音上传评分的闭环。
 */

import sentences from '@shared/sentences.json';

import { asrRecognize, tts } from '../../utils/api';
import { playUrl, startRecord, stopRecord, RecorderWrapper } from '../../utils/audio';

interface SentenceItem {
  jp: string;
  romaji: string;
  hint: string;
}

interface ShadowingResult {
  text: string;
  score: number;
  stars: number;
  confidence?: number;
}

interface ShadowingPageData {
  currentIndex: number;
  currentSentence: SentenceItem;
  loadingTts: boolean;
  recording: boolean;
  result: ShadowingResult | null;
  hintVisible: boolean;
}

interface GlobalData {
  shadowingResult: ShadowingResult | null;
}

Page<ShadowingPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    currentIndex: 0,
    currentSentence: (sentences as SentenceItem[])[0],
    loadingTts: false,
    recording: false,
    result: null,
    hintVisible: false,
  },
  recorderWrapper: null as RecorderWrapper | null,
  audioContext: null as WechatMiniprogram.InnerAudioContext | null,
  onUnload() {
    this.audioContext?.destroy?.();
    this.audioContext = null;
  },
  /**
   * 切换罗马音与提示信息。
   */
  toggleHint() {
    this.setData({ hintVisible: !this.data.hintVisible });
  },
  /**
   * 请求 TTS 并播放示例音频。
   */
  async play() {
    const sentence = this.data.currentSentence;
    if (!sentence) {
      wx.showToast({ title: '暂无示例', icon: 'none' });
      return;
    }
    this.setData({ loadingTts: true });
    try {
      const url = await tts(sentence.jp);
      this.audioContext?.destroy?.();
      this.audioContext = playUrl(url);
    } catch (error) {
      console.error(error);
      wx.showToast({ title: '播放失败，请稍后再试', icon: 'none' });
    } finally {
      this.setData({ loadingTts: false });
    }
  },
  /**
   * 开始录音，最多录制 8 秒。
   */
  startRecording() {
    if (this.data.recording) {
      wx.showToast({ title: '正在录音', icon: 'none' });
      return;
    }
    this.recorderWrapper = startRecord(8000);
    this.setData({ recording: true });
    wx.showToast({ title: '开始录音', icon: 'none' });
    setTimeout(() => {
      if (this.data.recording) {
        this.stopRecording();
      }
    }, 8200);
  },
  /**
   * 停止录音并上传评分。
   */
  async stopRecording() {
    if (!this.recorderWrapper) {
      return;
    }
    try {
      const filePath = await stopRecord(this.recorderWrapper);
      this.recorderWrapper = null;
      this.setData({ recording: false });
      const sentence = this.data.currentSentence;
      const result = await asrRecognize(filePath, sentence.jp);
      this.setData({ result });
      const app = getApp<{ globalData: GlobalData }>();
      app.globalData.shadowingResult = result;
    } catch (error) {
      console.error(error);
      this.recorderWrapper = null;
      this.setData({ recording: false });
      wx.showToast({ title: '录音或识别失败，请重试', icon: 'none' });
    }
  },
  /**
   * 跳转到结果页复盘本次评分。
   */
  toResult() {
    wx.navigateTo({ url: '/pages/result/index?type=shadowing' });
  },
});

/**
 * @file 跟读训练页面：结合 Vant 组件展示例句卡片、录音流程与评分反馈。
 */

import sentences from '@shared/sentences.json';
import Toast from '@vant/weapp/toast/toast';

import type { AsrResponse, TtsPayload } from '../../utils/api';
import { asrRecognize, tts } from '../../utils/api';
import { playUrl, startRecord, stopRecord, RecorderWrapper } from '../../utils/audio';

interface SentenceItem {
  jp: string;
  romaji: string;
  hint: string;
}

interface ShadowingResult extends AsrResponse {
  /** 目标文本，便于结果页复盘 */
  target?: string;
}

interface ShadowingPageData {
  currentIndex: number;
  currentSentence: SentenceItem;
  loadingTts: boolean;
  recording: boolean;
  uploading: boolean;
  result: ShadowingResult | null;
  hintVisible: boolean;
  scorePercent: number;
}

interface GlobalData {
  shadowingResult: ShadowingResult | null;
  autoPlay: boolean;
}

const MAX_RECORDING_DURATION = 8000;

Page<ShadowingPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    currentIndex: 0,
    currentSentence: (sentences as SentenceItem[])[0],
    loadingTts: false,
    recording: false,
    uploading: false,
    result: null,
    hintVisible: false,
    scorePercent: 0,
  },
  recorderWrapper: null as RecorderWrapper | null,
  audioContext: null as WechatMiniprogram.InnerAudioContext | null,
  onUnload() {
    this.audioContext?.destroy?.();
    this.audioContext = null;
  },
  onShow() {
    const app = getApp<{ globalData: GlobalData }>();
    if (app.globalData.autoPlay && !this.data.recording && !this.data.loadingTts) {
      // 自动播放示例句，帮助用户快速进入练习状态。
      this.play();
    }
  },
  /**
   * 切换罗马音提示的显隐状态，帮助初学者确认发音。
   */
  toggleHint() {
    this.setData({ hintVisible: !this.data.hintVisible });
  },
  /**
   * 请求 TTS 并播放示例音频，使用 Loading 按钮提示状态。
   */
  async play() {
    const sentence = this.data.currentSentence;
    if (!sentence) {
      Toast({ type: 'fail', message: '暂无示例句' });
      return;
    }
    this.setData({ loadingTts: true });
    try {
      const payload: TtsPayload = await tts(sentence.jp);
      this.audioContext?.destroy?.();
      this.audioContext = playUrl(payload.url);
      Toast({ type: 'success', message: '示例已播放' });
    } catch (error) {
      console.error('[shadowing-tts]', error);
      Toast({ type: 'fail', message: '播放失败，请稍后再试' });
    } finally {
      this.setData({ loadingTts: false });
    }
  },
  /**
   * 开始录音：触发后会在 MAX_RECORDING_DURATION 到期时自动调用 stopRecording。
   */
  startRecording() {
    if (this.data.recording) {
      Toast({ type: 'fail', message: '正在录音，请勿重复操作' });
      return;
    }
    this.recorderWrapper = startRecord(MAX_RECORDING_DURATION);
    this.setData({ recording: true, uploading: false });
    Toast({ type: 'success', message: '录音已开始' });
    setTimeout(() => {
      if (this.data.recording) {
        this.stopRecording();
      }
    }, MAX_RECORDING_DURATION + 200);
  },
  /**
   * 停止录音并上传评分，使用 uploading 标记控制按钮 loading 状态。
   */
  async stopRecording() {
    if (!this.recorderWrapper) {
      return;
    }
    try {
      const filePath = await stopRecord(this.recorderWrapper);
      this.recorderWrapper = null;
      this.setData({ recording: false, uploading: true });
      const sentence = this.data.currentSentence;
      const result = await asrRecognize(filePath, sentence.jp);
      const percent = Math.round(result.score * 100);
      const enriched: ShadowingResult = { ...result, target: sentence.jp };
      this.setData({ result: enriched, uploading: false, scorePercent: percent });
      const app = getApp<{ globalData: GlobalData }>();
      app.globalData.shadowingResult = enriched;
      Toast({ type: 'success', message: '识别完成，看看得分吧！' });
    } catch (error) {
      console.error('[shadowing-upload]', error);
      this.recorderWrapper = null;
      this.setData({ recording: false, uploading: false });
      Toast({ type: 'fail', message: '录音或识别失败，请重试' });
    }
  },
  /**
   * 跳转到结果页复盘本次评分。
   */
  toResult() {
    wx.navigateTo({ url: '/pages/result/index?type=shadowing' });
  },
});

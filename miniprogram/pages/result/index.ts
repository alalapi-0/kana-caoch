/**
 * @file 结果页面：聚合测验与跟读成绩，提供再次练习入口与进度趋势。
 */

import type { DailyProgressPoint, ProgressOverview } from '../../utils/api';
import { fetchDailyProgress, fetchProgressOverview } from '../../utils/api';

interface KanaResultItem {
  kana: string;
  romaji: string;
  user: string;
  stars: number;
  accuracy: number;
  distance: number;
}

interface ShadowingResult {
  text: string;
  score: number;
  stars: number;
  confidence?: number;
  wer?: number;
  distance?: number;
  target?: string;
}

interface WrongAnswerItem {
  kana: string;
  expected: string;
  actual: string;
  accuracy: number;
}

interface ResultSummary {
  /** 总星数（测验 + 跟读） */
  totalStars: number;
  /** 平均准确率（仅测验） */
  avgAccuracy: number;
  /** 跟读词错误率 */
  wer: number | null;
  /** 跟读编辑距离 */
  distance: number | null;
  /** 错词列表 */
  wrongList: WrongAnswerItem[];
  /** 跟读得分百分比 */
  shadowingScorePercent: number | null;
}

interface ResultPageData {
  type: string;
  kanaResults: KanaResultItem[];
  shadowingResult: ShadowingResult | null;
  summary: ResultSummary;
  overview: ProgressOverview | null;
  dailyStats: Array<{ label: string; value: number; secondary: number }>;
  loadingDaily: boolean;
}

interface GlobalData {
  kanaResults: KanaResultItem[];
  shadowingResult: ShadowingResult | null;
}

function formatLabel(date: string): string {
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) {
    return date;
  }
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

Page<ResultPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    type: '',
    kanaResults: [],
    shadowingResult: null,
    summary: {
      totalStars: 0,
      avgAccuracy: 0,
      wer: null,
      distance: null,
      wrongList: [],
      shadowingScorePercent: null,
    },
    overview: null,
    dailyStats: [],
    loadingDaily: false,
  },
  onLoad(query: Record<string, string>) {
    const app = getApp<{ globalData: GlobalData }>();
    const type = query.type || 'summary';
    const kanaResults = (app.globalData.kanaResults || []) as KanaResultItem[];
    const shadowingResult = (app.globalData.shadowingResult || null) as ShadowingResult | null;
    this.setData({ type, kanaResults, shadowingResult });
    this.composeSummary();
    this.loadOverview();
    this.loadDaily();
  },
  /**
   * 计算结果摘要，包括总星数、平均准确率与错词列表。
   */
  composeSummary() {
    const totalStars = this.data.kanaResults.reduce((sum, item) => sum + item.stars, 0);
    const wrongList: WrongAnswerItem[] = this.data.kanaResults
      .filter((item) => item.user.toLowerCase() !== item.romaji.toLowerCase())
      .map((item) => ({
        kana: item.kana,
        expected: item.romaji,
        actual: item.user || '未填写',
        accuracy: item.accuracy,
      }));
    const avgAccuracy = this.data.kanaResults.length
      ? this.data.kanaResults.reduce((sum, item) => sum + item.accuracy, 0) /
        this.data.kanaResults.length
      : 0;
    const shadowingStars = this.data.shadowingResult?.stars || 0;
    const summary: ResultSummary = {
      totalStars: totalStars + shadowingStars,
      avgAccuracy,
      wer: typeof this.data.shadowingResult?.wer === 'number' ? this.data.shadowingResult?.wer || 0 : null,
      distance:
        typeof this.data.shadowingResult?.distance === 'number'
          ? this.data.shadowingResult?.distance ?? 0
          : null,
      wrongList,
      shadowingScorePercent: this.data.shadowingResult
        ? Math.round((this.data.shadowingResult.score || 0) * 100)
        : null,
    };
    this.setData({ summary });
  },
  /**
   * 从后端获取今日概览，用于展示进度条信息。
   */
  async loadOverview() {
    try {
      const overview = await fetchProgressOverview();
      this.setData({ overview });
    } catch (error) {
      console.warn('[result-overview-fail]', error);
    }
  },
  /**
   * 获取近 7 天数据驱动迷你柱状图。
   */
  async loadDaily() {
    this.setData({ loadingDaily: true });
    try {
      const daily = await fetchDailyProgress();
      const mapped = (daily as DailyProgressPoint[]).map((item) => ({
        label: formatLabel(item.date),
        value: Math.max(0, item.quizCount + item.shadowingCount),
        secondary: Number(item.avgStars) || 0,
      }));
      this.setData({ dailyStats: mapped, loadingDaily: false });
    } catch (error) {
      console.warn('[result-daily-fail]', error);
      this.setData({ loadingDaily: false });
    }
  },
  /**
   * 再次练习，根据来源跳转至对应页面。
   */
  practiceAgain() {
    if (this.data.type === 'shadowing') {
      wx.redirectTo({ url: '/pages/shadowing/index' });
    } else {
      wx.redirectTo({ url: '/pages/kana-quiz/index' });
    }
  },
  /**
   * 返回首页，便于继续练习。
   */
  goHome() {
    wx.reLaunch({ url: '/pages/home/index' });
  },
});

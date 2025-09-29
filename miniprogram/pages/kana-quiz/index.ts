/**
 * @file 五十音测验页面，基于共享数据生成题目并进行本地评分。
 */

import kanaList from '@shared/kana.json';

import { computeQuizScore } from '../../utils/score';

interface KanaItem {
  kana: string;
  romaji: string;
}

interface QuizResult extends KanaItem {
  user: string;
  stars: number;
  accuracy: number;
  distance: number;
}

interface QuizPageData {
  index: number;
  total: number;
  userInput: string;
  current: KanaItem | null;
  questions: KanaItem[];
  results: QuizResult[];
}

interface GlobalData {
  kanaResults: QuizResult[];
}

function pickQuestions(count: number): KanaItem[] {
  const copy = (kanaList as KanaItem[]).slice();
  // 洗牌算法，确保练习题目顺序随机。
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

Page<QuizPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    index: 0,
    total: 0,
    userInput: '',
    current: null,
    questions: [],
    results: [],
  },
  onLoad() {
    const questions = pickQuestions(5);
    this.setData({
      questions,
      total: questions.length,
      current: questions[0] ?? null,
    });
  },
  /**
   * 输入框更新用户答案。
   * @param event Input 事件。
   */
  onInput(event: WechatMiniprogram.Input) {
    this.setData({ userInput: event.detail.value });
  },
  /**
   * 提交当前题目并计算星级。
   */
  submit() {
    const current = this.data.current;
    if (!current) {
      wx.showToast({ title: '题目已完成', icon: 'none' });
      return;
    }
    const { accuracy, stars, distance } = computeQuizScore(current.romaji, this.data.userInput);
    const result: QuizResult = {
      ...current,
      user: this.data.userInput,
      accuracy,
      stars,
      distance,
    };
    const nextIndex = this.data.index + 1;
    const nextQuestion = nextIndex < this.data.total ? this.data.questions[nextIndex] : null;
    const results = [...this.data.results, result];
    this.setData({
      results,
      index: nextIndex,
      current: nextQuestion,
      userInput: '',
    });

    const app = getApp<{ globalData: GlobalData }>();
    app.globalData.kanaResults = results;

    if (!nextQuestion) {
      wx.showModal({
        title: '测验完成',
        content: '已完成全部题目，是否查看结果？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/result/index?type=kana' });
          }
        },
      });
    } else {
      wx.showToast({ title: `已提交，第 ${nextIndex + 1} 题准备中`, icon: 'none' });
    }
  },
  /**
   * 主动跳转到结果页，便于用户复盘。
   */
  goResult() {
    wx.navigateTo({ url: '/pages/result/index?type=kana' });
  },
});

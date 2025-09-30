/**
 * @file 五十音测验页面：结合 Vant 表单提供即时校验、卡片化题目展示与星级反馈。
 */

import kanaList from '@shared/kana.json';
import Toast from '@vant/weapp/toast/toast';

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
  /** 当前题目索引 */
  index: number;
  /** 题目总数 */
  total: number;
  /** 输入框内容 */
  userInput: string;
  /** 当前题目对象 */
  current: KanaItem | null;
  /** 题目数组 */
  questions: KanaItem[];
  /** 已完成的题目结果 */
  results: QuizResult[];
  /** 表单错误信息，用于展示在 Field 下方 */
  fieldError: string;
  /** 测验进度百分比 */
  progressPercent: number;
}

interface GlobalData {
  kanaResults: QuizResult[];
}

const QUESTION_COUNT = 5;
const ROMAJI_PATTERN = /^[a-zA-Z\s-]+$/;

function pickQuestions(count: number): KanaItem[] {
  const copy = (kanaList as KanaItem[]).slice();
  // 洗牌算法，确保练习题目顺序随机。
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function validateInput(value: string): string | null {
  /**
   * @description 表单校验：禁止空值与非字母字符，确保输入可用于编辑距离比较。
   */
  if (!value.trim()) {
    return '请输入罗马音答案';
  }
  if (!ROMAJI_PATTERN.test(value)) {
    return '仅支持英文字母、空格或连字符';
  }
  return null;
}

Page<QuizPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    index: 0,
    total: QUESTION_COUNT,
    userInput: '',
    current: null,
    questions: [],
    results: [],
    fieldError: '',
    progressPercent: 0,
  },
  onLoad() {
    const questions = pickQuestions(QUESTION_COUNT);
    this.setData({
      questions,
      total: questions.length,
      current: questions[0] ?? null,
      progressPercent: 0,
    });
  },
  /**
   * 处理输入事件，实时更新数据并清除历史错误。
   * @param event Vant Field change 事件。
   */
  onFieldChange(event: WechatMiniprogram.CustomEvent<string | { value: string }>) {
    const detail = event.detail;
    const value = typeof detail === 'object' && detail !== null ? detail.value : detail;
    this.setData({ userInput: value || '', fieldError: '' });
  },
  /**
   * 提交当前题目并计算星级，使用 Toast 给出反馈。
   */
  submit() {
    const current = this.data.current;
    if (!current) {
      Toast({ type: 'fail', message: '题目已完成' });
      return;
    }
    const error = validateInput(this.data.userInput);
    if (error) {
      this.setData({ fieldError: error });
      Toast({ type: 'fail', message: error });
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
    const percent = Math.min(100, Math.round((nextIndex / this.data.total) * 100));
    this.setData({
      results,
      index: nextIndex,
      current: nextQuestion,
      userInput: '',
      fieldError: '',
      progressPercent: percent,
    });

    const app = getApp<{ globalData: GlobalData }>();
    app.globalData.kanaResults = results;

    if (!nextQuestion) {
      Toast({ type: 'success', message: '测验完成，可前往结果页复盘' });
    } else {
      Toast({ type: 'success', message: `第 ${nextIndex} 题完成，继续加油！` });
    }
  },
  /**
   * 主动跳转到结果页，便于用户复盘。
   */
  goResult() {
    wx.navigateTo({ url: '/pages/result/index?type=kana' });
  },
});

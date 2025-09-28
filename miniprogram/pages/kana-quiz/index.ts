import { normalizeInput, starsFromAccuracy } from '../../utils/score';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const kanaData: { kana: string; romaji: string }[] = require('../../../shared/kana.json');

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

Page({
  data: {
    index: 0,
    total: Math.min(10, kanaData.length),
    userInput: '',
    current: kanaData[0],
    results: [] as { kana: string; romaji: string; user: string; stars: number; accuracy: number }[],
  },
  onLoad() {
    const total = Math.min(10, kanaData.length);
    this.setData({
      total,
      current: kanaData[0],
    });
  },
  onInput(event: WechatMiniprogram.Input) {
    this.setData({ userInput: event.detail.value });
  },
  submit() {
    const current = this.data.current;
    if (!current) return;
    const expected = normalizeInput(current.romaji);
    const answer = normalizeInput(this.data.userInput);
    const distance = levenshtein(expected, answer);
    const accuracy = expected.length
      ? Math.max(0, 1 - distance / expected.length)
      : answer.length === 0
      ? 1
      : 0;
    const stars = starsFromAccuracy(accuracy);
    const newResult = {
      kana: current.kana,
      romaji: current.romaji,
      user: this.data.userInput,
      stars,
      accuracy,
    };
    const nextIndex = this.data.index + 1;
    this.setData({
      results: [...this.data.results, newResult],
      userInput: '',
      index: nextIndex,
      current: kanaData[nextIndex] || null,
    });
    if (nextIndex >= this.data.total) {
      wx.navigateTo({
        url: '/pages/result/index?type=kana',
      });
      const app = getApp<{ globalData: Record<string, unknown> }>();
      app.globalData.kanaResults = [...this.data.results, newResult];
    }
  },
});

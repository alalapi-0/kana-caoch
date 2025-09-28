Page({
  data: {
    type: '',
    kanaResults: [] as { kana: string; romaji: string; user: string; stars: number; accuracy: number }[],
    shadowingResult: null as null | { text: string; score: number; stars: number },
  },
  onLoad(query: Record<string, string>) {
    const app = getApp<{ globalData: Record<string, unknown> }>();
    const type = query.type || 'summary';
    this.setData({ type });
    if (type === 'kana') {
      const results = (app.globalData.kanaResults || []) as typeof this.data.kanaResults;
      this.setData({ kanaResults: results });
    }
    if (type === 'shadowing') {
      const result = (app.globalData.shadowingResult || null) as typeof this.data.shadowingResult;
      this.setData({ shadowingResult: result });
    }
  },
  goHome() {
    wx.reLaunch({ url: '/pages/home/index' });
  },
});

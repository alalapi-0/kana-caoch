/**
 * @file 结果页面，根据不同类型展示测验或跟读成绩。
 */

interface KanaResultItem {
  kana: string;
  romaji: string;
  user: string;
  stars: number;
  accuracy: number;
}

interface ShadowingResult {
  text: string;
  score: number;
  stars: number;
  confidence?: number;
}

interface ResultPageData {
  type: string;
  kanaResults: KanaResultItem[];
  shadowingResult: ShadowingResult | null;
}

interface GlobalData {
  kanaResults: KanaResultItem[];
  shadowingResult: ShadowingResult | null;
}

Page<ResultPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    type: '',
    kanaResults: [],
    shadowingResult: null,
  },
  /**
   * 根据路由参数加载数据。
   */
  onLoad(query: Record<string, string>) {
    const app = getApp<{ globalData: GlobalData }>();
    const type = query.type || 'summary';
    this.setData({ type });
    if (type === 'kana') {
      const results = app.globalData.kanaResults || [];
      this.setData({ kanaResults: results });
    }
    if (type === 'shadowing') {
      const result = app.globalData.shadowingResult || null;
      this.setData({ shadowingResult: result });
    }
  },
  /**
   * 返回首页，便于继续练习。
   */
  goHome() {
    wx.reLaunch({ url: '/pages/home/index' });
  },
});

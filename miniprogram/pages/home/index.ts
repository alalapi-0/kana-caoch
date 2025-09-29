/**
 * @file 首页，展示核心功能入口卡片。
 */

interface CardItem {
  title: string;
  description: string;
  target: string;
}

interface HomePageData {
  cards: CardItem[];
}

Page<HomePageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    cards: [
      {
        title: '五十音测验',
        description: '练习假名与罗马音的对应',
        target: '/pages/kana-quiz/index',
      },
      {
        title: '跟读训练',
        description: '听例句并录音跟读打分',
        target: '/pages/shadowing/index',
      },
    ],
  },
  /**
   * 点击卡片跳转到对应页面。
   * @param event 点击事件。
   */
  navigate(event: WechatMiniprogram.TouchEvent) {
    const target = event.currentTarget.dataset.target as string | undefined;
    if (target) {
      wx.navigateTo({ url: target });
    } else {
      wx.showToast({ title: '暂未开放', icon: 'none' });
    }
  },
});

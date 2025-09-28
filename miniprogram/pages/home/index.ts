Page({
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
  navigate(event: WechatMiniprogram.TouchEvent) {
    const target = event.currentTarget.dataset.target;
    if (target) {
      wx.navigateTo({ url: target });
    }
  },
});

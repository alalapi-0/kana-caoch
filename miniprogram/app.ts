App({
  globalData: {
    baseUrl: wx.getStorageSync('baseUrl') || 'http://localhost:3000',
    kanaResults: [],
    shadowingResult: null,
  },
});

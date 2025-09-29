/**
 * @file 设置页面，占位展示语速与播音人选择，并允许配置服务端地址。
 */

interface SettingsPageData {
  voiceOptions: string[];
  speedOptions: string[];
  voiceIndex: number;
  speedIndex: number;
  baseUrl: string;
}

interface GlobalData {
  baseUrl: string;
}

Page<SettingsPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    voiceOptions: ['默认女声', '青年男声'],
    speedOptions: ['稍慢', '正常', '稍快'],
    voiceIndex: 0,
    speedIndex: 1,
    baseUrl: 'http://localhost:3000',
  },
  onLoad() {
    const app = getApp<{ globalData: GlobalData }>();
    this.setData({ baseUrl: app.globalData.baseUrl });
  },
  /**
   * 切换播音人。
   */
  onVoiceChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ voiceIndex: Number(event.detail.value) });
  },
  /**
   * 切换语速。
   */
  onSpeedChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ speedIndex: Number(event.detail.value) });
  },
  /**
   * 输入新的后端地址。
   */
  onBaseUrlInput(event: WechatMiniprogram.Input) {
    this.setData({ baseUrl: event.detail.value });
  },
  /**
   * 保存后端地址到全局数据与本地存储。
   */
  saveBaseUrl() {
    const value = this.data.baseUrl.trim();
    if (!value) {
      wx.showToast({ title: '地址不能为空', icon: 'none' });
      return;
    }
    const app = getApp<{ globalData: GlobalData }>();
    app.globalData.baseUrl = value;
    wx.setStorageSync('baseUrl', value);
    wx.showToast({ title: '已保存', icon: 'success' });
  },
});

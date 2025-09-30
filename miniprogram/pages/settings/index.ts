/**
 * @file 设置页面：通过 Vant Form/Field/Switch 构建配置表单，包含语速、音色、自动播放与后端地址。
 */

import Toast from '@vant/weapp/toast/toast';

interface SettingsPageData {
  voiceOptions: string[];
  speedOptions: string[];
  voiceIndex: number;
  speedIndex: number;
  baseUrl: string;
  autoPlay: boolean;
}

interface GlobalData {
  baseUrl: string;
}

Page<SettingsPageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    voiceOptions: ['默认女声', '青年男声', '成熟女声'],
    speedOptions: ['稍慢', '正常', '稍快'],
    voiceIndex: 0,
    speedIndex: 1,
    baseUrl: 'http://localhost:3000',
    autoPlay: true,
  },
  onLoad() {
    const app = getApp<{ globalData: GlobalData }>();
    this.setData({ baseUrl: app.globalData.baseUrl });
  },
  /**
   * 通过操作表选择播音人。
   */
  pickVoice() {
    new Promise<WechatMiniprogram.ShowActionSheetSuccessCallbackResult>((resolve, reject) => {
      wx.showActionSheet({
        itemList: this.data.voiceOptions,
        success: resolve,
        fail: reject,
      });
    })
      .then((res) => {
        this.setData({ voiceIndex: res.tapIndex });
      })
      .catch(() => {
        // 用户取消无需提示
      });
  },
  /**
   * 通过操作表选择语速。
   */
  pickSpeed() {
    new Promise<WechatMiniprogram.ShowActionSheetSuccessCallbackResult>((resolve, reject) => {
      wx.showActionSheet({
        itemList: this.data.speedOptions,
        success: resolve,
        fail: reject,
      });
    })
      .then((res) => {
        this.setData({ speedIndex: res.tapIndex });
      })
      .catch(() => {
        // 取消选择时无需提示
      });
  },
  /**
   * 输入新的后端地址。
   */
  onBaseUrlInput(event: WechatMiniprogram.CustomEvent<string | { value: string }>) {
    const detail = event.detail;
    const value = typeof detail === 'object' && detail !== null ? detail.value : detail;
    this.setData({ baseUrl: value || '' });
  },
  /**
   * 切换自动播放设置。
   */
  onAutoPlayChange(event: WechatMiniprogram.CustomEvent<boolean | { value: boolean }>) {
    const detail = event.detail;
    const value = typeof detail === 'object' && detail !== null ? detail.value : detail;
    this.setData({ autoPlay: !!value });
  },
  /**
   * 提交表单时保存后端地址并给出提示。
   */
  onSubmit() {
    const value = this.data.baseUrl.trim();
    if (!value) {
      Toast({ type: 'fail', message: '地址不能为空' });
      return;
    }
    const app = getApp<{ globalData: GlobalData }>();
    app.globalData.baseUrl = value;
    wx.setStorageSync('baseUrl', value);
    wx.setStorageSync('autoPlay', this.data.autoPlay);
    Toast({ type: 'success', message: '设置已保存' });
  },
});

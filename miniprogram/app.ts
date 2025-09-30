/**
 * @file 小程序全局配置，初始化全局数据与基础网络配置。
 */

interface GlobalData {
  /** 服务端基础地址，可在设置页修改并持久化到 Storage 中 */
  baseUrl: string;
  /** 五十音测验结果缓存，供结果页展示 */
  kanaResults: Array<{ kana: string; romaji: string; user: string; stars: number; accuracy: number; distance: number }>;
  /** 跟读训练结果缓存 */
  shadowingResult: null | { text: string; score: number; stars: number; confidence?: number; wer?: number; distance?: number; target?: string };
  /** 是否自动播放示例音频 */
  autoPlay: boolean;
}

App<{ globalData: GlobalData }>({
  onLaunch() {
    // 启动时读取持久化的后端地址，若不存在则使用默认 localhost。
    const storedBaseUrl = wx.getStorageSync('baseUrl');
    const storedAutoPlay = wx.getStorageSync('autoPlay');
    this.globalData.baseUrl = storedBaseUrl || 'http://localhost:3000';
    if (typeof storedAutoPlay === 'boolean') {
      this.globalData.autoPlay = storedAutoPlay;
    }
  },
  globalData: {
    baseUrl: 'http://localhost:3000',
    kanaResults: [],
    shadowingResult: null,
    autoPlay: true,
  },
});

Page({
  data: {
    voiceOptions: ['默认女声', '青年男声'],
    speedOptions: ['正常', '稍慢', '稍快'],
    voiceIndex: 0,
    speedIndex: 0,
  },
  onVoiceChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ voiceIndex: Number(event.detail.value) });
  },
  onSpeedChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ speedIndex: Number(event.detail.value) });
  },
});

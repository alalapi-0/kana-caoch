/**
 * @file 星级展示组件。
 * @description 该组件用于在业务层统一封装评分星级的展示逻辑，
 * 为未来替换 UI 库（如从 Vant 切换至原生组件或其他库）预留适配层。
 */

Component({
  properties: {
    /** 当前星数，允许为小数用于展示半星效果 */
    stars: {
      type: Number,
      value: 0,
    },
    /** 最大星数，默认 5 */
    max: {
      type: Number,
      value: 5,
    },
    /** 星星尺寸，单位 rpx */
    size: {
      type: Number,
      value: 28,
    },
  },
  data: {
    /**
     * @description 实际传递给 Vant Rate 组件的星数。
     * 通过监听器确保不超过上限并向下取 0。
     */
    displayStars: 0,
  },
  observers: {
    /**
     * 监听属性变更并同步归一化后的星级。
     * @param stars 原始星级。
     * @param max 最大星级上限。
     */
    'stars, max'(stars: number, max: number) {
      const safeMax = Number.isFinite(max) && max > 0 ? max : 5;
      const safeStars = Math.max(0, Math.min(safeMax, Number(stars) || 0));
      this.setData({ displayStars: safeStars, max: safeMax });
    },
  },
  methods: {},
});

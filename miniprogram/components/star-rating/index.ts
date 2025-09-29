/**
 * @file 星级展示组件，支持 0~5 星并提供可访问性文案。
 */

Component({
  properties: {
    /** 当前星数 */
    stars: {
      type: Number,
      value: 0,
    },
    /** 最大星数，默认 5 */
    max: {
      type: Number,
      value: 5,
    },
  },
  data: {},
  methods: {
    /**
     * 生成 [1, max] 的数组供模板遍历。
     * @returns number[] 星级数组。
     */
    range(): number[] {
      const max = this.data.max || 5;
      return Array.from({ length: max }, (_, i) => i + 1);
    },
  },
});

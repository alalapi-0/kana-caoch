Component({
  properties: {
    stars: {
      type: Number,
      value: 0,
    },
    max: {
      type: Number,
      value: 5,
    },
  },
  data: {},
  methods: {
    range(): number[] {
      const max = this.data.max || 5;
      return Array.from({ length: max }, (_, i) => i + 1);
    },
  },
});

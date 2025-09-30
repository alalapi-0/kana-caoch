/**
 * @file 迷你柱状图组件，通过 Canvas 原生绘制近 7 天练习概览。
 * @description
 *  - 组件仅依赖原生 2D Canvas，避免引入额外图表库以控制包体体积。
 *  - 支持展示练习次数（柱状）与平均星级（折线/标记），默认绘制最近 7 天数据。
 */

interface MiniBarPoint {
  /** 日期标签，例如 05-01 */
  label: string;
  /** 主数值，通常用于表示练习次数 */
  value: number;
  /** 次数值，表示平均星级（0~5），使用折线提示趋势 */
  secondary?: number;
}

interface MiniBarsProperties {
  /** 外部传入的数据列表 */
  stats: MiniBarPoint[];
  /** 加载态标识，loading 为 true 时展示提示文案并暂停绘制 */
  loading: boolean;
  /** 自定义图表标题 */
  title: string;
}

interface MiniBarsData {
  /** Canvas 初始化标记，避免在节点未准备好时绘制 */
  ready: boolean;
}

interface MiniBarsMethods {
  /** 初始化 Canvas 上下文并保存尺寸信息 */
  initCanvas(): void;
  /** 根据最新数据重绘图表 */
  draw(): void;
  /** 清空画布，防止残影 */
  clearCanvas(ctx: WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D, width: number, height: number): void;
}

const PADDING_HORIZONTAL = 16;
const PADDING_VERTICAL = 28;

Component<MiniBarsData, MiniBarsProperties, MiniBarsMethods>({
  properties: {
    stats: {
      type: Array,
      value: [],
      observer: 'draw',
    },
    loading: {
      type: Boolean,
      value: false,
      observer: 'draw',
    },
    title: {
      type: String,
      value: '近 7 天练习趋势',
    },
  },
  data: {
    ready: false,
  },
  lifetimes: {
    /**
     * 组件挂载完成后，读取 Canvas 节点并结合像素比设置实际绘制尺寸。
     */
    ready() {
      this.initCanvas();
    },
    detached() {
      // 组件销毁时清理缓存的上下文引用，帮助 GC 释放内存。
      const instance = this as WechatMiniprogram.Component.TrivialInstance & {
        __ctx__?: WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D | null;
        __size__?: { width: number; height: number } | null;
      };
      instance.__ctx__ = null;
      instance.__size__ = null;
    },
  },
  methods: {
    initCanvas() {
      const query = wx.createSelectorQuery().in(this);
      query
        .select('#mini-bars-canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const detail = res?.[0] as
            | { node: WechatMiniprogram.Canvas | null; width: number; height: number }
            | undefined;
          if (!detail || !detail.node) {
            console.warn('[mini-bars] canvas 节点不可用');
            return;
          }
          const systemInfo = wx.getSystemInfoSync();
          const dpr = systemInfo.pixelRatio || 1;
          const canvas = detail.node as WechatMiniprogram.Canvas;
          const ctx = canvas.getContext('2d') as WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D;

          // 设置实际像素尺寸，结合 DPR 防止高分屏模糊。
          canvas.width = detail.width * dpr;
          canvas.height = detail.height * dpr;
          ctx.scale(dpr, dpr);

          const instance = this as WechatMiniprogram.Component.TrivialInstance & {
            __ctx__?: WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D;
            __size__?: { width: number; height: number };
          };
          instance.__ctx__ = ctx;
          instance.__size__ = { width: detail.width, height: detail.height };

          this.setData({ ready: true }, () => {
            this.draw();
          });
        });
    },
    draw() {
      const instance = this as WechatMiniprogram.Component.TrivialInstance & {
        __ctx__?: WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D | null;
        __size__?: { width: number; height: number } | null;
      };

      if (!this.data.ready || this.data.loading) {
        return;
      }

      const ctx = instance.__ctx__;
      const size = instance.__size__;
      if (!ctx || !size) {
        return;
      }

      const width = size.width;
      const height = size.height;
      this.clearCanvas(ctx, width, height);

      const stats = (this.data.stats as MiniBarPoint[]) || [];
      if (!stats.length) {
        return;
      }

      const maxValue = Math.max(
        1,
        ...stats.map((item) => (Number.isFinite(item.value) ? Math.max(0, item.value) : 0)),
      );
      const chartHeight = height - PADDING_VERTICAL * 2;
      const chartWidth = width - PADDING_HORIZONTAL * 2;
      const barWidth = chartWidth / (stats.length * 1.6);
      const gap = (chartWidth - barWidth * stats.length) / Math.max(stats.length - 1, 1);

      ctx.save();
      ctx.translate(PADDING_HORIZONTAL, height - PADDING_VERTICAL);

      stats.forEach((item, index) => {
        const safeValue = Math.max(0, Number(item.value) || 0);
        const barHeight = (safeValue / maxValue) * chartHeight;
        const x = index * (barWidth + gap);
        const y = -barHeight;

        // 绘制柱状图主体，使用半透明主题色区分已完成练习数。
        ctx.fillStyle = '#3b82f6';
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.globalAlpha = 1;

        // 在柱顶绘制数值标签，帮助理解实际数据。
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(safeValue), x + barWidth / 2, y - 6);

        // 绘制平均星级折线点，范围 0~5。
        if (typeof item.secondary === 'number') {
          const secondary = Math.max(0, Math.min(5, item.secondary));
          const secondaryY = -(secondary / 5) * chartHeight;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, secondaryY, 3, 0, Math.PI * 2);
          ctx.fill();

          // 使用折线连接相邻点，展示星级变化趋势。
          if (index > 0) {
            const prev = stats[index - 1];
            if (typeof prev.secondary === 'number') {
              const prevSecondary = Math.max(0, Math.min(5, prev.secondary));
              const prevY = -(prevSecondary / 5) * chartHeight;
              const prevX = (index - 1) * (barWidth + gap) + barWidth / 2;
              ctx.strokeStyle = '#f97316';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(prevX, prevY);
              ctx.lineTo(x + barWidth / 2, secondaryY);
              ctx.stroke();
            }
          }
        }

        // 日期标签放置在底部，采用轻量字体避免干扰主体。
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, 18);
      });

      ctx.restore();
    },
    clearCanvas(ctx, width, height) {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.restore();
    },
  },
});

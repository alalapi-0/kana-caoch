/**
 * @file 首页，承载功能入口、进度卡片与日度趋势可视化。
 */

import type { DailyProgressPoint, ProgressOverview } from '../../utils/api';
import { fetchDailyProgress, fetchProgressOverview } from '../../utils/api';

interface EntryItem {
  /** 展示标题 */
  title: string;
  /** 描述信息 */
  description: string;
  /** 目标路由地址 */
  target: string;
  /** Unicode 图标字符，避免引入二进制资源 */
  icon: string;
}

interface MiniBarViewModel {
  /** 显示标签（MM/DD） */
  label: string;
  /** 当日总练习次数 */
  value: number;
  /** 平均星级，用于折线提示 */
  secondary: number;
}

interface HomePageData {
  /** 功能入口配置 */
  entries: EntryItem[];
  /** 进度概览数据 */
  overview: ProgressOverview | null;
  /** 迷你柱状图数据 */
  miniBarStats: MiniBarViewModel[];
  /** 接口加载态 */
  loadingProgress: boolean;
}

function formatLabel(date: string): string {
  /**
   * @description 将 YYYY-MM-DD 字符串转换为 MM/DD，若解析失败则原样返回。
   */
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) {
    return date;
  }
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

Page<HomePageData, WechatMiniprogram.Page.CustomOptions>({
  data: {
    entries: [
      {
        title: '五十音测验',
        description: '测测假名转写，巩固基础',
        target: '/pages/kana-quiz/index',
        icon: 'あ',
      },
      {
        title: '跟读训练',
        description: '听示例跟读，获取实时评分',
        target: '/pages/shadowing/index',
        icon: '🎙',
      },
    ],
    overview: null,
    miniBarStats: [],
    loadingProgress: false,
  },
  onLoad() {
    this.loadProgress();
  },
  onPullDownRefresh() {
    this.loadProgress().finally(() => {
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 跳转到对应页面。
   * @param event Tap 事件，携带 data-target。
   */
  navigate(event: WechatMiniprogram.TouchEvent) {
    const target = event.currentTarget.dataset.target as string | undefined;
    if (target) {
      wx.navigateTo({ url: target });
    } else {
      wx.showToast({ title: '暂未开放', icon: 'none' });
    }
  },
  /**
   * 调用进度接口，更新今日完成度与近 7 天趋势。
   */
  async loadProgress() {
    this.setData({ loadingProgress: true });
    try {
      const [overview, daily] = await Promise.all([
        fetchProgressOverview(),
        fetchDailyProgress(),
      ]);
      const stats: MiniBarViewModel[] = (daily as DailyProgressPoint[]).map((item) => ({
        label: formatLabel(item.date),
        value: Math.max(0, item.quizCount + item.shadowingCount),
        secondary: Number(item.avgStars) || 0,
      }));
      this.setData({ overview, miniBarStats: stats, loadingProgress: false });
    } catch (error) {
      console.error('[home-progress-error]', error);
      this.setData({ loadingProgress: false });
      wx.showToast({ title: '进度加载失败，请稍后重试', icon: 'none' });
    }
  },
});

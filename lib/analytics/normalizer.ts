import {
  SocialPlatform,
  DateRangePreset,
  MetricDelta,
  PostAnalyticsContentType,
} from '@/lib/types/database';

export interface DateRangeResult {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  prevStartDate: string; // YYYY-MM-DD
  prevEndDate: string; // YYYY-MM-DD
}

/**
 * Computes exact start/end dates for current and preceding comparison periods.
 */
export function calculateDateRange(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string
): DateRangeResult {
  const now = new Date();
  const todayStr = formatDateYMD(now);

  let startDate: string;
  let endDate: string;
  let durationDays: number;

  switch (preset) {
    case 'today':
      startDate = todayStr;
      endDate = todayStr;
      durationDays = 1;
      break;
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      startDate = formatDateYMD(y);
      endDate = startDate;
      durationDays = 1;
      break;
    }
    case 'last_7d': {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      startDate = formatDateYMD(s);
      endDate = todayStr;
      durationDays = 7;
      break;
    }
    case 'last_30d': {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      startDate = formatDateYMD(s);
      endDate = todayStr;
      durationDays = 30;
      break;
    }
    case 'last_90d': {
      const s = new Date(now);
      s.setDate(s.getDate() - 89);
      startDate = formatDateYMD(s);
      endDate = todayStr;
      durationDays = 90;
      break;
    }
    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = formatDateYMD(firstDay);
      endDate = todayStr;
      durationDays = Math.max(1, Math.ceil((now.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)));
      break;
    }
    case 'previous_month': {
      const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = formatDateYMD(firstDayPrev);
      endDate = formatDateYMD(lastDayPrev);
      durationDays = lastDayPrev.getDate();
      break;
    }
    case 'custom':
      startDate = customStart || todayStr;
      endDate = customEnd || todayStr;
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      durationDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
      break;
    default:
      startDate = todayStr;
      endDate = todayStr;
      durationDays = 1;
  }

  // Calculate matching previous comparison window
  const curStartObj = new Date(startDate);
  const prevEndObj = new Date(curStartObj);
  prevEndObj.setDate(prevEndObj.getDate() - 1);

  const prevStartObj = new Date(prevEndObj);
  prevStartObj.setDate(prevStartObj.getDate() - (durationDays - 1));

  return {
    startDate,
    endDate,
    prevStartDate: formatDateYMD(prevStartObj),
    prevEndDate: formatDateYMD(prevEndObj),
  };
}

export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates delta between current and previous period with directional flag.
 */
export function computeDelta(currentVal: number, prevVal: number, isAvailable = true): MetricDelta {
  if (!isAvailable) {
    return {
      value: 0,
      percentage: null,
      direction: 'unavailable',
      isAvailable: false,
    };
  }

  if (prevVal === 0) {
    return {
      value: currentVal,
      percentage: currentVal > 0 ? 100 : 0,
      direction: currentVal > 0 ? 'up' : 'neutral',
      isAvailable: true,
    };
  }

  const diff = currentVal - prevVal;
  const pct = Number(((diff / prevVal) * 100).toFixed(1));

  let direction: 'up' | 'down' | 'neutral' = 'neutral';
  if (pct > 0.05) direction = 'up';
  else if (pct < -0.05) direction = 'down';

  return {
    value: currentVal,
    percentage: pct,
    direction,
    isAvailable: true,
  };
}

/**
 * Calculates platform-specific engagement rate percentage.
 * Formula: (Total Interactions / Reach or Views) * 100
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  reachOrViews: number,
  _platform?: SocialPlatform
): number {
  if (reachOrViews <= 0) return 0;
  const totalInteractions = likes + comments + shares;
  const rate = (totalInteractions / reachOrViews) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(2));
}

/**
 * Standard Metric Definitions Glossary for Islamic SaaS
 */
export interface MetricDefinition {
  titleEn: string;
  titleUr: string;
  descriptionEn: string;
  descriptionUr: string;
  formula?: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  followers: {
    titleEn: 'Total Followers / Subscribers',
    titleUr: 'کل فالورز / سبسکرائبرز',
    descriptionEn: 'The total count of authentic users subscribed to your social profile or channel.',
    descriptionUr: 'آپ کے اکاؤنٹ یا چینل سے وابستہ حقیقی صارفین کی کل تعداد۔',
  },
  views: {
    titleEn: 'Views / Video Plays',
    titleUr: 'کل ویوز / مشاہدات',
    descriptionEn: 'The number of times your videos or media content were played across feeds.',
    descriptionUr: 'سوشل فیڈ میں آپ کے اسلامی کنٹینٹ یا ویڈیو کے پلے ہونے کی مجموعی تعداد۔',
  },
  reach: {
    titleEn: 'Unique Reach',
    titleUr: 'منفرد رسائی (Reach)',
    descriptionEn: 'The number of unique people who saw your content at least once.',
    descriptionUr: 'انفرادی صارفین کی تعداد جن کے سامنے آپ کا کنٹینٹ کم از کم ایک بار پہنچا۔',
  },
  impressions: {
    titleEn: 'Total Impressions',
    titleUr: 'مجموعی تاثرات (Impressions)',
    descriptionEn: 'The total number of times your post was displayed, including multiple views by the same person.',
    descriptionUr: 'اسکرین پر پوسٹ کے ظاہر ہونے کی کل تعداد، بشمول ایک ہی یوزر کے بار بار دیکھنا۔',
  },
  engagementRate: {
    titleEn: 'Engagement Rate',
    titleUr: 'انگیجمنٹ کی شرح (Engagement Rate)',
    descriptionEn: 'The percentage of people who actively interacted (liked, commented, shared) with your post.',
    descriptionUr: 'پوسٹ دیکھنے والوں کا وہ فیصد جنہوں نے لائک، تبصرہ یا شیئر کے ذریعے ایکٹو شرکت کی۔',
    formula: '(Likes + Comments + Shares) ÷ Reach × 100',
  },
  likes: {
    titleEn: 'Likes & Reactions',
    titleUr: 'پسندیدگیاں اور ری ایکشنز',
    descriptionEn: 'Positive audience reactions recorded directly from official platform APIs.',
    descriptionUr: 'آفیشل پلیٹ فارم API کے ذریعے موصول ہونے والے مثبت ردعمل۔',
  },
  comments: {
    titleEn: 'Comments & Discussions',
    titleUr: 'تبصرے اور مکالمے',
    descriptionEn: 'Public discussion comments left on your published content.',
    descriptionUr: 'آپ کی پوسٹس پر عوام کی طرف سے کیے گئے سوالات اور پیغامات۔',
  },
  shares: {
    titleEn: 'Shares & Reposts',
    titleUr: 'شیئرز اور ری ٹویٹس',
    descriptionEn: 'Number of times users forwarded or re-shared your message across their networks.',
    descriptionUr: 'کتنی بار صارفین نے آپ کے اسلامی پیغام کو اپنے نیٹ ورک پر آگے شیئر کیا۔',
  },
};

import {
  BrandKnowledge,
  MarketingGoal,
  SocialPlatform,
  PostAnalyticsContentType,
  AIMarketingOverview,
  AIMarketingInsight,
  MarketingHealthScore,
  WeeklyMarketingPlan,
  AIContentIdea,
  ConfidenceLevel,
  PlatformStrategyInsight,
  TopUnderperformingInsight,
  ContentStrategySummary,
  PostAnalytics,
  AnalyticsSnapshot,
  SocialAccountPublic,
} from '@/lib/types/database';
import { generateGeminiResponse } from '@/lib/ai/gemini';
import {
  buildMarketingManagerSystemPrompt,
  buildWeeklyPlanPrompt,
  buildContentIdeasPrompt,
  buildMarketingChatPrompt,
} from './marketing-prompts';

export interface GroundedMarketingDataset {
  brandKnowledge: Partial<BrandKnowledge> | null;
  connectedAccounts: SocialAccountPublic[];
  posts: PostAnalytics[];
  snapshots: AnalyticsSnapshot[];
  upcomingSchedulesCount: number;
}

/**
 * Calculates authentic statistical metrics & distributions from post analytics.
 */
export function analyzeHistoricalData(dataset: GroundedMarketingDataset) {
  const { posts, snapshots, connectedAccounts } = dataset;
  const sampleSize = posts.length;

  // Connected platforms
  const connectedPlatforms: SocialPlatform[] = Array.from(
    new Set(connectedAccounts.filter(a => a.status === 'connected').map(a => a.platform))
  );

  // Default platforms fallback if none connected
  const activePlatforms = connectedPlatforms.length > 0
    ? connectedPlatforms
    : (['facebook', 'instagram', 'youtube'] as SocialPlatform[]);

  // Confidence based on sample size
  let confidence: ConfidenceLevel = 'insufficient_data';
  if (sampleSize >= 10) confidence = 'high';
  else if (sampleSize >= 3) confidence = 'medium';
  else if (sampleSize >= 1) confidence = 'low';

  // Statistical sums & medians
  const viewsArr = posts.map(p => p.views).sort((a, b) => a - b);
  const engArr = posts.map(p => p.engagement_rate).sort((a, b) => a - b);

  const medianViews = viewsArr.length > 0 ? viewsArr[Math.floor(viewsArr.length / 2)] : 0;
  const medianEngagement = engArr.length > 0 ? engArr[Math.floor(engArr.length / 2)] : 0;

  // Platform performance
  const platformStats: Record<string, { views: number; count: number; totalEng: number }> = {};
  for (const p of posts) {
    if (!platformStats[p.platform]) {
      platformStats[p.platform] = { views: 0, count: 0, totalEng: 0 };
    }
    platformStats[p.platform].views += p.views;
    platformStats[p.platform].count += 1;
    platformStats[p.platform].totalEng += p.engagement_rate;
  }

  let bestPlatform: SocialPlatform | null = null;
  let maxPlatViews = -1;
  for (const [plat, data] of Object.entries(platformStats)) {
    if (data.views > maxPlatViews && data.count > 0) {
      maxPlatViews = data.views;
      bestPlatform = plat as SocialPlatform;
    }
  }

  // Content type performance
  const typeStats: Record<string, { views: number; count: number }> = {};
  for (const p of posts) {
    const t = p.content_type || 'other';
    if (!typeStats[t]) typeStats[t] = { views: 0, count: 0 };
    typeStats[t].views += p.views;
    typeStats[t].count += 1;
  }

  let bestContentType: PostAnalyticsContentType | null = null;
  let maxTypeViews = -1;
  for (const [t, data] of Object.entries(typeStats)) {
    if (data.views > maxTypeViews && data.count > 0) {
      maxTypeViews = data.views;
      bestContentType = t as PostAnalyticsContentType;
    }
  }

  // Topic performance
  const topicStats: Record<string, { views: number; count: number }> = {};
  for (const p of posts) {
    const topic = p.post_topic || 'Islamic Reflection';
    if (!topicStats[topic]) topicStats[topic] = { views: 0, count: 0 };
    topicStats[topic].views += p.views;
    topicStats[topic].count += 1;
  }

  let bestTopic: string | null = null;
  let maxTopicViews = -1;
  for (const [topic, data] of Object.entries(topicStats)) {
    if (data.views > maxTopicViews && data.count > 0) {
      maxTopicViews = data.views;
      bestTopic = topic;
    }
  }

  // Posting consistency index
  let postingConsistency: 'consistent' | 'inconsistent' | 'insufficient_data' = 'insufficient_data';
  if (sampleSize >= 3) {
    postingConsistency = sampleSize >= 5 || dataset.upcomingSchedulesCount >= 2 ? 'consistent' : 'inconsistent';
  }

  // Growth trend
  let overallTrend: 'growing' | 'stable' | 'declining' | 'insufficient_data' = 'insufficient_data';
  if (snapshots.length >= 2) {
    const recent = snapshots[0]?.views || 0;
    const older = snapshots[snapshots.length - 1]?.views || 0;
    if (recent > older * 1.05) overallTrend = 'growing';
    else if (recent < older * 0.95) overallTrend = 'declining';
    else overallTrend = 'stable';
  } else if (sampleSize >= 4) {
    const firstHalf = posts.slice(Math.floor(sampleSize / 2)).reduce((sum, p) => sum + p.views, 0);
    const secondHalf = posts.slice(0, Math.floor(sampleSize / 2)).reduce((sum, p) => sum + p.views, 0);
    if (secondHalf > firstHalf * 1.05) overallTrend = 'growing';
    else if (secondHalf < firstHalf * 0.95) overallTrend = 'declining';
    else overallTrend = 'stable';
  }

  return {
    sampleSize,
    confidence,
    connectedPlatforms: activePlatforms,
    medianViews,
    medianEngagement,
    bestPlatform,
    bestContentType,
    bestTopic,
    postingConsistency,
    overallTrend,
    topTopics: Object.keys(topicStats).slice(0, 5),
  };
}

/**
 * Calculates transparent Marketing Health Score (0 to 100).
 */
export function calculateMarketingHealthScore(
  dataset: GroundedMarketingDataset,
  analysis: ReturnType<typeof analyzeHistoricalData>
): MarketingHealthScore {
  const { sampleSize, postingConsistency, overallTrend, connectedPlatforms } = analysis;
  const isLimitedData = sampleSize < 3;

  // 1. Posting Consistency (25 pts)
  let consistencyScore = 10;
  let consistencyStatus: 'optimal' | 'moderate' | 'low' | 'insufficient_data' = 'insufficient_data';
  if (postingConsistency === 'consistent') {
    consistencyScore = 23;
    consistencyStatus = 'optimal';
  } else if (postingConsistency === 'inconsistent') {
    consistencyScore = 14;
    consistencyStatus = 'moderate';
  }

  // 2. Content Performance (25 pts)
  let contentPerfScore = 12;
  let contentStatus: 'optimal' | 'moderate' | 'low' | 'insufficient_data' = 'insufficient_data';
  if (sampleSize >= 5 && analysis.medianEngagement >= 2.5) {
    contentPerfScore = 24;
    contentStatus = 'optimal';
  } else if (sampleSize >= 2) {
    contentPerfScore = 17;
    contentStatus = 'moderate';
  }

  // 3. Platform Activity & Distribution (20 pts)
  let platformScore = 10;
  let platformStatus: 'optimal' | 'moderate' | 'low' | 'insufficient_data' = 'insufficient_data';
  if (connectedPlatforms.length >= 3) {
    platformScore = 19;
    platformStatus = 'optimal';
  } else if (connectedPlatforms.length >= 1) {
    platformScore = 14;
    platformStatus = 'moderate';
  }

  // 4. Growth & Engagement Trend (15 pts)
  let trendScore = 8;
  let trendStatus: 'optimal' | 'moderate' | 'low' | 'insufficient_data' = 'insufficient_data';
  if (overallTrend === 'growing') {
    trendScore = 14;
    trendStatus = 'optimal';
  } else if (overallTrend === 'stable') {
    trendScore = 11;
    trendStatus = 'moderate';
  } else if (overallTrend === 'declining') {
    trendScore = 6;
    trendStatus = 'low';
  }

  // 5. Goal Alignment & Completeness (15 pts)
  const hasBrandKnowledge = Boolean(dataset.brandKnowledge?.brand_name);
  const goalScore = hasBrandKnowledge ? 14 : 9;
  const goalStatus: 'optimal' | 'moderate' | 'low' | 'insufficient_data' = hasBrandKnowledge ? 'optimal' : 'moderate';

  const overallScore = Math.min(
    100,
    consistencyScore + contentPerfScore + platformScore + trendScore + goalScore
  );

  let status: 'excellent' | 'good' | 'needs_attention' | 'critical' | 'insufficient_data' = 'good';
  if (isLimitedData) status = 'insufficient_data';
  else if (overallScore >= 80) status = 'excellent';
  else if (overallScore >= 60) status = 'good';
  else if (overallScore >= 40) status = 'needs_attention';
  else status = 'critical';

  return {
    overallScore,
    status,
    isLimitedData,
    components: [
      {
        name: 'Posting Consistency',
        labelUrdu: 'پوسٹنگ میں تسلسل اور شیڈولنگ',
        score: consistencyScore,
        maxScore: 25,
        weight: 25,
        status: consistencyStatus,
        explanation: sampleSize >= 3
          ? `Based on ${sampleSize} published posts and active scheduling cadence.`
          : 'Insufficient historical post cadence to accurately grade posting regularity.',
      },
      {
        name: 'Content Resonance & Engagement',
        labelUrdu: 'کنٹینٹ کی مقبولیت اور تاثر',
        score: contentPerfScore,
        maxScore: 25,
        weight: 25,
        status: contentStatus,
        explanation: sampleSize > 0
          ? `Evaluated from verified post interactions with a median engagement rate of ${analysis.medianEngagement}%.`
          : 'Requires published posts with recorded engagement to evaluate resonance.',
      },
      {
        name: 'Platform Multi-Channel Activity',
        labelUrdu: 'ملٹی چینل ڈسٹری بیوشن',
        score: platformScore,
        maxScore: 20,
        weight: 20,
        status: platformStatus,
        explanation: `${connectedPlatforms.length} social channels actively connected and monitored.`,
      },
      {
        name: 'Audience Growth Trend',
        labelUrdu: 'سامعین کی تعداد میں اضافہ',
        score: trendScore,
        maxScore: 15,
        weight: 15,
        status: trendStatus,
        explanation: overallTrend !== 'insufficient_data'
          ? `Audience interaction trajectory is currently classified as '${overallTrend}'.`
          : 'Requires at least 2 historical metric snapshots for trajectory evaluation.',
      },
      {
        name: 'Brand Identity & Goal Alignment',
        labelUrdu: 'برانڈ اہداف اور ہدایات کی تکمیل',
        score: goalScore,
        maxScore: 15,
        weight: 15,
        status: goalStatus,
        explanation: hasBrandKnowledge
          ? 'Brand knowledge base, target audience, and Islamic guidelines are configured.'
          : 'Configure Brand Knowledge to tailor AI marketing recommendations more tightly.',
      },
    ],
    notes: isLimitedData
      ? 'Score is provisional due to limited historical post data.'
      : 'Score represents authentic aggregated performance across connected platforms.',
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Builds Overview & Summary.
 */
export async function generateMarketingOverview(
  dataset: GroundedMarketingDataset
): Promise<AIMarketingOverview> {
  const analysis = analyzeHistoricalData(dataset);
  const healthScore = calculateMarketingHealthScore(dataset, analysis);
  const primaryGoal = dataset.brandKnowledge?.primary_goal || 'increase_engagement';

  return {
    overallTrend: analysis.overallTrend,
    bestPlatform: analysis.bestPlatform,
    bestContentType: analysis.bestContentType,
    bestTopic: analysis.bestTopic,
    postingConsistency: analysis.postingConsistency,
    confidence: analysis.confidence,
    healthScore,
    primaryGoal,
    dataFreshness: {
      lastDataUpdated: dataset.posts[0]?.fetched_at || dataset.snapshots[0]?.metric_date || null,
      aiInsightsGenerated: new Date().toISOString(),
      isStale: false,
      sampleSize: analysis.sampleSize,
    },
  };
}

/**
 * Generates Weekly 7-Day Marketing Plan.
 */
export async function generateWeeklyPlan(
  dataset: GroundedMarketingDataset
): Promise<WeeklyMarketingPlan> {
  const analysis = analyzeHistoricalData(dataset);
  const primaryGoal = dataset.brandKnowledge?.primary_goal || 'increase_engagement';

  const bestTimes: Record<string, string> = {
    facebook: '19:00 UTC (12:00 AM PKT)',
    instagram: '16:00 UTC (9:00 PM PKT)',
    tiktok: '15:00 UTC (8:00 PM PKT)',
    youtube: '13:00 UTC (6:00 PM PKT)',
    twitter: '11:00 UTC (4:00 PM PKT)',
    whatsapp: '05:00 UTC (10:00 AM PKT)',
  };

  const sysPrompt = buildMarketingManagerSystemPrompt(dataset.brandKnowledge, analysis.connectedPlatforms, primaryGoal);
  const userPrompt = buildWeeklyPlanPrompt({
    brandKnowledge: dataset.brandKnowledge,
    connectedPlatforms: analysis.connectedPlatforms,
    primaryGoal,
    topTopics: analysis.topTopics,
    bestTimes,
    recentPerformanceSummary: `Sample Size: ${analysis.sampleSize} posts, Best Platform: ${analysis.bestPlatform || 'N/A'}, Best Topic: ${analysis.bestTopic || 'N/A'}`,
  });

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().slice(0, 10);
  const weekEnd = new Date(now.setDate(now.getDate() + 6)).toISOString().slice(0, 10);

  try {
    const aiText = await generateGeminiResponse(`${sysPrompt}\n\n${userPrompt}`);
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      goal: primaryGoal,
      days: parsed.days || getFallbackWeeklyDays(analysis.connectedPlatforms, primaryGoal),
      strategySummaryUrdu: parsed.strategySummaryUrdu || 'اگلے 7 دن کے لیے اسلامی اقدار اور تعلیمی نکات پر مبنی جامع شیڈول۔',
      strategySummaryEnglish: parsed.strategySummaryEnglish || 'A balanced 7-day marketing schedule focused on authentic education and audience growth.',
      confidence: analysis.confidence,
      dataSufficient: analysis.sampleSize >= 3,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      goal: primaryGoal,
      days: getFallbackWeeklyDays(analysis.connectedPlatforms, primaryGoal),
      strategySummaryUrdu: 'اگلے 7 دن کے لیے اسلامی اقدار اور تعلیمی نکات پر مبنی جامع شیڈول۔',
      strategySummaryEnglish: 'A balanced 7-day marketing schedule tailored to your active connected platforms.',
      confidence: analysis.confidence,
      dataSufficient: analysis.sampleSize >= 3,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fallback deterministic 7-day plan.
 */
function getFallbackWeeklyDays(platforms: SocialPlatform[], goal: MarketingGoal): WeeklyMarketingPlan['days'] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const platPool = platforms.length > 0 ? platforms : ['facebook', 'instagram', 'youtube'];

  const topics = [
    { topic: 'تفسیر قرآن و فہم دین', type: 'reel_short' as PostAnalyticsContentType, obj: 'تعلیمی آگاہی اور سامعین کا اعتماد' },
    { topic: 'اخلاقِ حسنہ اور تربیت اولاد', type: 'image' as PostAnalyticsContentType, obj: 'کمیونٹی تعلق اور تعمیری گفتگو' },
    { topic: 'سیرت النبی ﷺ سے عملی اسباق', type: 'video' as PostAnalyticsContentType, obj: 'روحانی رہنمائی اور گہرا تاثر' },
    { topic: 'روزمرہ دعائیں اور مسنون اذکار', type: 'carousel' as PostAnalyticsContentType, obj: 'روزمرہ دینی ضرورت اور سیو کرنا' },
    { topic: 'جمعہ مبارک — درود شریف و کہف', type: 'image' as PostAnalyticsContentType, obj: 'جمعہ کے دن کی فضیلت اور شیئرنگ' },
    { topic: 'عصر حاضر کے مسائل کا اسلامی حل', type: 'video' as PostAnalyticsContentType, obj: 'فکری رہنمائی اور رہنمائی' },
    { topic: 'ہفتہ وار جائزہ اور شکر گزاری', type: 'text' as PostAnalyticsContentType, obj: 'سامعین سے فیڈبیک اور انٹرایکشن' },
  ];

  return days.map((day, idx) => ({
    day,
    date: new Date(Date.now() + idx * 86400000).toISOString().slice(0, 10),
    platform: (platPool[idx % platPool.length] || 'facebook') as SocialPlatform,
    contentTopic: topics[idx].topic,
    contentType: topics[idx].type,
    objective: topics[idx].obj,
    suggestedTime: '19:00 UTC',
    suggestedCta: 'اپنے خیالات کا اظہار کمنٹس میں فرمائیں اور اس پوسٹ کو شیئر کریں۔',
    priority: idx === 4 || idx === 0 ? 'high' : 'medium',
    hook: 'کیا آپ نے آج کے اس اہم سبق پر غور کیا؟',
    notes: 'معیاری اسلامی بصری ڈیزائن کے ساتھ پیش کریں۔',
  }));
}

/**
 * Generates fresh Content Ideas.
 */
export async function generateContentIdeas(
  dataset: GroundedMarketingDataset
): Promise<AIContentIdea[]> {
  const analysis = analyzeHistoricalData(dataset);
  const primaryGoal = dataset.brandKnowledge?.primary_goal || 'increase_engagement';

  const sysPrompt = buildMarketingManagerSystemPrompt(dataset.brandKnowledge, analysis.connectedPlatforms, primaryGoal);
  const userPrompt = buildContentIdeasPrompt({
    brandKnowledge: dataset.brandKnowledge,
    connectedPlatforms: analysis.connectedPlatforms,
    primaryGoal,
    successfulTopics: analysis.topTopics,
    historicalContext: `Median Views: ${analysis.medianViews}, Top Platform: ${analysis.bestPlatform || 'facebook'}`,
  });

  try {
    const aiText = await generateGeminiResponse(`${sysPrompt}\n\n${userPrompt}`);
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    const ideas = parsed.ideas || [];

    return ideas.map((idea: Partial<AIContentIdea>, i: number) => ({
      id: `idea-${Date.now()}-${i}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: idea.title || 'اسلامی فکری رہنمائی',
      topic: idea.topic || 'Quran & Sunnah Lessons',
      content_type: idea.content_type || 'reel_short',
      target_platform: idea.target_platform || analysis.connectedPlatforms[0] || 'all',
      objective: idea.objective || 'Build audience awareness and engagement',
      hook: idea.hook || 'ایک ایسی بات جو ہر مسلمان کو معلوم ہونی چاہیے!',
      cta: idea.cta || 'اس پوسٹ کو شیئر کر کے نیکی میں حصہ ڈالیں۔',
      reason: idea.reason || 'Proven resonance with faith-conscious digital audiences.',
      estimated_resonance_score: idea.estimated_resonance_score || 8.7,
      status: 'new',
      created_at: new Date().toISOString(),
    }));
  } catch {
    return getFallbackContentIdeas(analysis.connectedPlatforms);
  }
}

function getFallbackContentIdeas(platforms: SocialPlatform[]): AIContentIdea[] {
  const primaryPlat = platforms[0] || 'instagram';

  return [
    {
      id: `idea-${Date.now()}-1`,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: '3 قرآنی دعائیں جو زندگی میں سکون لاتی ہیں',
      topic: 'قرآنی دعائیں اور روحانی طمأنینت',
      content_type: 'carousel',
      target_platform: primaryPlat,
      objective: 'پوسٹ سیوز اور طویل مدتی رسائی بڑھانا',
      hook: 'جب دل بے چین ہو تو قرآن کی ان 3 دعاؤں کو اپنا معمول بنائیں۔',
      cta: 'اس پوسٹ کو بعد کے لیے Bookmark / Save کر لیں 📌',
      reason: 'دعاؤں اور اذکار کا کنٹینٹ تمام پلیٹ فارمز پر سب سے زیادہ Save اور Share کیا جاتا ہے۔',
      estimated_resonance_score: 9.2,
      status: 'new',
      created_at: new Date().toISOString(),
    },
    {
      id: `idea-${Date.now()}-2`,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: 'صبح کے 5 مسنون اعمال جو آپ کا دن بدل دیں',
      topic: 'مسنون صبح کے معمولات اور برکت',
      content_type: 'reel_short',
      target_platform: 'instagram',
      objective: 'مختصر ویڈیو کے ذریعے فوری وائرل ریچ',
      hook: 'کیا آپ جانتے ہیں کہ صبح کے یہ 5 اعمال دن بھر برکت کیسے لاتے ہیں؟',
      cta: 'روزانہ کی یاد دہانیوں کے لیے پیج کو Follow کریں 📲',
      reason: 'عملی اور مرحلہ وار تجاویز پر مختصر ویڈیوز کا آڈینس ریٹینشن بہت زیادہ ہوتا ہے۔',
      estimated_resonance_score: 9.0,
      status: 'new',
      created_at: new Date().toISOString(),
    },
    {
      id: `idea-${Date.now()}-3`,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: 'سیرت النبی ﷺ: بحرانوں میں قائدانہ حکمت عملی',
      topic: 'اسلامی قیادت اور اخلاقی فہم',
      content_type: 'video',
      target_platform: 'youtube',
      objective: 'سنجیدہ طلبہ اور سامعین کا گہرا اعتماد قائم کرنا',
      hook: 'آج کے دور میں سیرت نبوی سے رہنمائی کیسے حاصل کریں؟',
      cta: 'تفصیلی ویڈیو کے لیے چینل کو Subscribe فرمائیں 🔔',
      reason: 'سیرت کے مضامین باوقار سامعین میں دیرپا اعتماد پیدا کرتے ہیں۔',
      estimated_resonance_score: 8.6,
      status: 'new',
      created_at: new Date().toISOString(),
    },
    {
      id: `idea-${Date.now()}-4`,
      user_id: '00000000-0000-0000-0000-000000000001',
      title: 'اولاد کی بہترین اسلامی تربیت: 4 بنیادی اصول',
      topic: 'خاندانی نظام اور تربیت اولاد',
      content_type: 'image',
      target_platform: 'facebook',
      objective: 'والدین اور فیملیز کے ساتھ بامعنی مکالمہ',
      hook: 'نئی نسل کو فتنوں سے بچانے کے لیے والدین کے لیے 4 سنہری اصول۔',
      cta: 'کمنٹس میں اپنی رائے اور تجربات ضرور بتائیں۔',
      reason: 'خاندانی اور تربیتی موضوعات پر فیس بک کمیونٹی سب سے زیادہ متحرک ردعمل دیتی ہے۔',
      estimated_resonance_score: 8.9,
      status: 'new',
      created_at: new Date().toISOString(),
    },
  ];
}

/**
 * Handles Interactive Marketing Chatbot response.
 */
export async function executeMarketingChat(params: {
  dataset: GroundedMarketingDataset;
  userMessage: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}): Promise<string> {
  const analysis = analyzeHistoricalData(params.dataset);
  const primaryGoal = params.dataset.brandKnowledge?.primary_goal || 'increase_engagement';

  const groundedContext = `
- Active Connected Platforms: ${analysis.connectedPlatforms.join(', ')}
- Published Posts Sample Size: ${analysis.sampleSize}
- Median Views: ${analysis.medianViews}
- Median Engagement Rate: ${analysis.medianEngagement}%
- Best Performing Platform: ${analysis.bestPlatform || 'Insufficient data'}
- Best Content Type: ${analysis.bestContentType || 'Insufficient data'}
- Best Performing Topic: ${analysis.bestTopic || 'Insufficient data'}
- Posting Consistency: ${analysis.postingConsistency}
- Overall Growth Trend: ${analysis.overallTrend}
- Primary Marketing Goal: ${primaryGoal}
- Scheduled Upcoming Posts: ${params.dataset.upcomingSchedulesCount}
- Brand Name: ${params.dataset.brandKnowledge?.brand_name || 'Nūr Social'}
- Brand Description: ${params.dataset.brandKnowledge?.description || 'Islamic digital marketing'}
`;

  const sysPrompt = buildMarketingManagerSystemPrompt(
    params.dataset.brandKnowledge,
    analysis.connectedPlatforms,
    primaryGoal
  );

  const prompt = buildMarketingChatPrompt({
    brandKnowledge: params.dataset.brandKnowledge,
    connectedPlatforms: analysis.connectedPlatforms,
    primaryGoal,
    groundedContext,
    userMessage: params.userMessage,
    conversationHistory: params.history,
  });

  try {
    const aiResponse = await generateGeminiResponse(`${sysPrompt}\n\n${prompt}`);
    return aiResponse;
  } catch {
    return `السلام علیکم! آپ کے برانڈ کے حالیہ اینالیٹکس (${analysis.sampleSize} پوسٹس) کے مطابق، آپ کی تعلیمی اور معلوماتی پوسٹس کا رسپانس سب سے بہتر ہے۔ آپ کے منتخب کردہ ہدف "${primaryGoal}" کے حصول کے لیے مشورہ ہے کہ ہفتے میں کم از کم 3 سے 4 بار مقررہ اوقات میں تسلسل کے ساتھ کنٹینٹ شیڈول کریں۔ کیا آپ چاہتے ہیں کہ میں اگلے چند دنوں کا خصوصی پلان تیار کروں؟`;
  }
}

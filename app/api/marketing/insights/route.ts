import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { analyzeHistoricalData } from '@/lib/ai/marketing-intelligence';
import { AIMarketingInsight } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataset = await fetchGroundedDataset(user.id);
    const analysis = analyzeHistoricalData(dataset);
    const goal = dataset.brandKnowledge?.primary_goal || 'increase_engagement';

    const insights: AIMarketingInsight[] = [];
    const nowIso = new Date().toISOString();
    const expiryIso = new Date(Date.now() + 7 * 86400000).toISOString();

    // 1. Content Insight
    insights.push({
      id: 'ins-content-1',
      user_id: user.id,
      insight_type: 'content',
      title: analysis.bestTopic ? ('اعلیٰ کارکردگی کا حامل موضوع: ' + analysis.bestTopic) : 'کنٹینٹ تھیم تجزیہ',
      description: analysis.bestTopic
        ? ('آپ کے دستیاب تاریخی ڈیٹا کے مطابق "' + analysis.bestTopic + '" پر شائع کردہ پوسٹس نے سب سے زیادہ مستند ویوز اور اینگیجمنٹ حاصل کی۔')
        : 'کنٹینٹ کے موضوعات کا درست تجزیہ کرنے کے لیے کم از کم 3 پوسٹس درکار ہیں۔',
      recommendation: analysis.bestTopic
        ? ('اگلے ہفتے "' + analysis.bestTopic + '" کے ذیلی موضوعات اور رہنمائی پر مزید پوسٹس شیڈول کرنے پر غور کریں۔')
        : 'متنوع موضوعات پر باقاعدہ کنٹینٹ شائع کریں تاکہ سامعین کی پسند کا تعین ہو سکے۔',
      supporting_data: {
        metrics: {
          bestTopic: analysis.bestTopic || 'None',
          sampleSize: analysis.sampleSize,
          medianEngagementRate: analysis.medianEngagement + '%',
        },
        sampleSize: analysis.sampleSize,
        period: 'Last 60 days',
        comparison: 'Across all published topic clusters',
        calculationNote: 'Calculated by aggregating genuine post views and engagement rates from official API metrics.',
      },
      confidence: analysis.confidence,
      is_active: true,
      expires_at: expiryIso,
      created_at: nowIso,
    });

    // 2. Platform Insight
    insights.push({
      id: 'ins-platform-1',
      user_id: user.id,
      insight_type: 'platform',
      title: analysis.bestPlatform ? ('سب سے مؤثر پلیٹ فارم: ' + analysis.bestPlatform.toUpperCase()) : 'ملٹی چینل ڈسٹری بیوشن',
      description: analysis.bestPlatform
        ? (analysis.bestPlatform.toUpperCase() + ' پر شائع کردہ مواد کا ردعمل اور انٹرایکشن تناسب دیگر پلیٹ فارمز کے مقابلے میں نمایاں رہا ہے۔')
        : 'فی الحال تمام پلیٹ فارمز پر مساوی ڈیٹا ریکارڈ ہو رہا ہے۔',
      recommendation: analysis.bestPlatform
        ? (analysis.bestPlatform.toUpperCase() + ' کو بنیادی چینل کے طور پر ترجیح دیں جبکہ دیگر چینلز پر کراس پوسٹنگ برقرار رکھیں۔')
        : 'اپنے تمام سوشل چینلز کنیکٹ کر کے پوسٹس شیڈول کریں۔',
      supporting_data: {
        metrics: {
          bestPlatform: analysis.bestPlatform || 'N/A',
          connectedCount: analysis.connectedPlatforms.length,
        },
        sampleSize: analysis.sampleSize,
        period: 'Last 60 days',
        comparison: 'Cross-platform total views and interaction comparison',
        calculationNote: 'Compared sum of views & engagement across connected platform APIs.',
      },
      confidence: analysis.confidence,
      platform: analysis.bestPlatform || 'all',
      is_active: true,
      expires_at: expiryIso,
      created_at: nowIso,
    });

    // 3. Action Insight (Recommended Actions)
    insights.push({
      id: 'ins-action-1',
      user_id: user.id,
      insight_type: 'action',
      title: 'پوسٹنگ کی مستقل مزاجی اور اوقات کی پابندی',
      description: analysis.postingConsistency === 'consistent'
        ? 'آپ کا پوسٹنگ شیڈول تسلسل کے ساتھ چل رہا ہے، جو الگورتھم کے مثبت سگنلز کے لیے بہترین ہے۔'
        : 'پوسٹنگ میں وقفہ زیادہ ہونے سے آرگینک ریچ متاثر ہو سکتی ہے۔',
      recommendation: 'ہدف "' + goal + '" کے لیے ہفتہ وار 3 سے 4 پوسٹس کو آٹومیٹک شیڈولر کے ذریعے پہلے سے پلان کریں۔',
      supporting_data: {
        metrics: {
          postingConsistency: analysis.postingConsistency,
          scheduledCount: dataset.upcomingSchedulesCount,
        },
        sampleSize: analysis.sampleSize,
        period: 'Current publishing cycle',
        calculationNote: 'Evaluated scheduled post queue against historical publishing frequency.',
      },
      confidence: analysis.sampleSize >= 3 ? 'high' : 'medium',
      is_active: true,
      expires_at: expiryIso,
      created_at: nowIso,
    });

    // 4. Audience Insight
    insights.push({
      id: 'ins-audience-1',
      user_id: user.id,
      insight_type: 'audience',
      title: 'سامعین کا ردعمل اور تفاعل (Audience Behavior)',
      description: analysis.sampleSize > 0
        ? ('آپ کے سامعین تعلیمی و باوقار اسلامی ویڈیوز اور کاروسیل پوسٹس پر اوسطاً ' + analysis.medianEngagement + '% اینگیجمنٹ ریٹ ظاہر کر رہے ہیں۔')
        : 'آڈینس بی ہیویئر کا مستند جائزہ لینے کے لیے مزید لائیو انٹرایکشنز کی ضرورت ہے۔',
      recommendation: 'پوسٹس کے اختتام پر فکر انگیز اور اخلاقی سوالات شامل کریں تاکہ کمنٹس کی تعداد میں قدرتی اضافہ ہو۔',
      supporting_data: {
        metrics: {
          medianEngagement: analysis.medianEngagement + '%',
          audienceCategory: 'Faith-conscious & Educational',
        },
        sampleSize: analysis.sampleSize,
        period: 'Last 60 days',
        calculationNote: 'Aggregated from verified likes, comments, and shares divided by reach/views.',
      },
      confidence: analysis.confidence,
      is_active: true,
      expires_at: expiryIso,
      created_at: nowIso,
    });

    return NextResponse.json({ success: true, insights });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch marketing insights';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

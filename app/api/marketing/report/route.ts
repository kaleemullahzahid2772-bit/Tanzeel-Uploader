import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { analyzeHistoricalData, calculateMarketingHealthScore } from '@/lib/ai/marketing-intelligence';
import { MarketingReportData } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'json';
    const dataset = await fetchGroundedDataset(user.id);
    const analysis = analyzeHistoricalData(dataset);
    const healthScore = calculateMarketingHealthScore(dataset, analysis);
    const brandName = dataset.brandKnowledge?.brand_name || 'Nūr Social';
    const goal = dataset.brandKnowledge?.primary_goal || 'increase_engagement';

    const report: MarketingReportData = {
      generatedAt: new Date().toISOString(),
      brandName,
      primaryGoal: goal,
      healthScore: healthScore.overallScore,
      healthStatus: healthScore.status,
      executiveSummaryUrdu: 'حالیہ ڈیٹا کے مطابق "' + brandName + '" کی مجموعی کارکردگی کا اسکور ' + healthScore.overallScore + '/100 ہے۔ ' + (analysis.bestTopic ? ('موضوع "' + analysis.bestTopic + '" سب سے نمایاں رہا۔') : ''),
      executiveSummaryEnglish: 'Overall marketing health is graded at ' + healthScore.overallScore + '/100 based on ' + analysis.sampleSize + ' verified post records. ' + (analysis.bestPlatform ? (analysis.bestPlatform.toUpperCase() + ' represents your strongest organic channel.') : ''),
      bestPlatform: analysis.bestPlatform ? analysis.bestPlatform.toUpperCase() : 'Limited Data',
      bestContentType: analysis.bestContentType ? analysis.bestContentType.toUpperCase() : 'Limited Data',
      bestTopic: analysis.bestTopic || 'General Reflections',
      postingConsistency: analysis.postingConsistency,
      topInsights: [
        'Sample size of ' + analysis.sampleSize + ' posts analyzed across active connected channels.',
        'Median engagement rate recorded at ' + analysis.medianEngagement + '%.',
        analysis.bestPlatform ? ('Top resonance observed on ' + analysis.bestPlatform + '.') : 'Multi-channel distribution active.',
      ],
      recommendedActions: [
        'Maintain scheduled posting cadence aligned with goal: ' + goal + '.',
        'Utilize 1-click repurposing to convert top video reflections into carousels and shorts.',
        'Review peak interaction hours and schedule posts 1-2 hours prior to peak engagement slots.',
      ],
      weeklyStrategy: [
        'Monday: Quranic Reflections & Tafsir highlights',
        'Wednesday: Seerah leadership lessons & Character building',
        'Friday: Special Jummah reminders & Community blessings',
        'Sunday: Interactive Q&A and Weekly Summary',
      ],
      dataLimitations: [
        analysis.sampleSize < 5 ? 'Provisional calculation due to small sample size.' : 'Based on authentic platform metrics.',
        'WhatsApp direct organic shares cannot be tracked via public API.',
      ],
    };

    if (format === 'csv') {
      const csvRows = [
        ['Nūr Social — AI Marketing Executive Strategy Report'],
        ['Generated At', report.generatedAt],
        ['Brand Name', report.brandName],
        ['Primary Marketing Goal', report.primaryGoal],
        ['Overall Health Score', report.healthScore + '/100 (' + report.healthStatus + ')'],
        ['Best Performing Platform', report.bestPlatform],
        ['Best Content Type', report.bestContentType],
        ['Best Topic', report.bestTopic],
        ['Posting Consistency', report.postingConsistency],
        [],
        ['KEY INSIGHTS'],
        ...report.topInsights.map(i => ['Insight', '"' + i + '"']),
        [],
        ['RECOMMENDED ACTIONS'],
        ...report.recommendedActions.map(a => ['Action', '"' + a + '"']),
        [],
        ['WEEKLY CONTENT STRATEGY'],
        ...report.weeklyStrategy.map(s => ['Schedule', '"' + s + '"']),
      ];

      const csvContent = csvRows.map(r => r.join(',')).join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="nur-social-marketing-report-' + new Date().toISOString().slice(0, 10) + '.csv"',
        },
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate marketing report';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

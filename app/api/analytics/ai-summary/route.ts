import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { generateGeminiResponse } from '@/lib/ai/gemini';
import { AISummaryReport } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    const supabase = await createClient();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { kpis, bestInsights, topTopics } = body;

    const views = kpis?.views?.value || 0;
    const likes = kpis?.likes?.value || 0;
    const comments = kpis?.comments?.value || 0;
    const shares = kpis?.shares?.value || 0;
    const reach = kpis?.reach?.value || 0;
    const publishedCount = kpis?.publishedPosts?.value || 0;
    const bestPlat = bestInsights?.bestPlatform || 'N/A';
    const bestTime = bestInsights?.bestTimeSlot || 'N/A';
    const bestDay = bestInsights?.bestDayOfWeek || 'N/A';

    const prompt = 'You are Nūr Social AI Performance Strategist. Generate a strictly data-grounded performance summary and actionable recommendations based ONLY on the authentic metrics provided below. DO NOT invent any numbers, fake reach, or unverified claims.\n\n' +
      'Metrics Provided:\n' +
      '- Total Views: ' + views + '\n' +
      '- Total Likes: ' + likes + '\n' +
      '- Total Comments: ' + comments + '\n' +
      '- Total Shares: ' + shares + '\n' +
      '- Total Reach: ' + reach + '\n' +
      '- Published Posts: ' + publishedCount + '\n' +
      '- Best Platform: ' + bestPlat + '\n' +
      '- Best Time Slot: ' + bestTime + '\n' +
      '- Best Day: ' + bestDay + '\n' +
      '- Top Topics: ' + JSON.stringify(topTopics || []) + '\n\n' +
      'Return a valid JSON object matching this schema exactly:\n' +
      '{\n' +
      '  "summaryUrdu": "2-3 sentences executive summary in refined Urdu focusing on genuine resonance.",\n' +
      '  "summaryEnglish": "2-3 sentences executive summary in English.",\n' +
      '  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],\n' +
      '  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"]\n' +
      '}';

    const aiRes = await generateGeminiResponse(prompt);
    let report: AISummaryReport;

    try {
      const cleanJson = aiRes.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      report = {
        summaryUrdu: parsed.summaryUrdu || 'آپ کے اسلامی کنٹینٹ نے منتخب کردہ مدت میں مستند سامعین تک رسائی حاصل کی۔',
        summaryEnglish: parsed.summaryEnglish || 'Your Islamic content demonstrated authentic engagement across active channels in the selected period.',
        keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : ['Consistent engagement across platforms'],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Maintain scheduled publishing cadence during peak resonance hours.'],
        generatedAt: new Date().toISOString(),
      };
    } catch {
      report = {
        summaryUrdu: 'آپ کے اسلامی کنٹینٹ نے منتخب کردہ مدت میں مستند سامعین تک رسائی حاصل کی۔',
        summaryEnglish: 'Your Islamic content demonstrated authentic engagement across active channels in the selected period.',
        keyStrengths: ['Authentic organic interactions recorded via official APIs.'],
        recommendations: ['Maintain scheduled publishing cadence during peak resonance hours.'],
        generatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ report });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate AI analytics summary';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
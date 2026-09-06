import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { fetchGroundedDataset } from '@/lib/ai/marketing-data';
import { executeMarketingChat } from '@/lib/ai/marketing-intelligence';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const dataset = await fetchGroundedDataset(user.id);
    const reply = await executeMarketingChat({
      dataset,
      userMessage: message.trim(),
      history: Array.isArray(history) ? history : [],
    });

    return NextResponse.json({
      success: true,
      reply,
      suggestedPrompts: [
        'اگلے ہفتے کے لیے 5 اہم موضوعات تجویز کریں',
        'میری پوسٹس کی اینگیجمنٹ بڑھانے کے 3 عملی طریقے کیا ہیں؟',
        'یوٹیوب ویڈیوز کو انسٹاگرام پر کیسے ری پرپز کریں؟',
        'کس دن اور وقت پر پوسٹ کرنا زیادہ مناسب ہے؟',
      ],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to execute marketing chat';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getClientSafeWordPressSettings,
  saveStoredWordPressSettings,
  testWordPressConnection,
  getStoredWordPressSettings,
} from '@/lib/wordpress/client';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieves safe client-facing WordPress settings (Password is masked and never exposed).
 */
export async function GET() {
  try {
    const settings = await getClientSafeWordPressSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err: unknown) {
    console.error('Error fetching WordPress settings:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve WordPress settings' },
      { status: 500 }
    );
  }
}

/**
 * POST: Saves and optionally tests WordPress credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { website_url, username, application_password, test_after_save } = body;

    if (!website_url || !website_url.trim()) {
      return NextResponse.json(
        { error: 'WordPress Website URL is required.' },
        { status: 400 }
      );
    }

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: 'WordPress Username is required.' },
        { status: 400 }
      );
    }

    // Save credentials (encrypted with AES-256-GCM)
    await saveStoredWordPressSettings({
      website_url,
      username,
      application_password,
    });

    let testResult = null;
    if (test_after_save) {
      const stored = await getStoredWordPressSettings();
      if (stored) {
        testResult = await testWordPressConnection(stored);
        if (testResult.success) {
          await saveStoredWordPressSettings({
            ...stored,
            is_connected: true,
          });
        }
      }
    }

    const safeSettings = await getClientSafeWordPressSettings();

    return NextResponse.json({
      success: true,
      data: safeSettings,
      testResult,
    });
  } catch (err: unknown) {
    console.error('Error saving WordPress settings:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

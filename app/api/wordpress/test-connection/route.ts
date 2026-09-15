import { NextRequest, NextResponse } from 'next/server';
import {
  testWordPressConnection,
  getStoredWordPressSettings,
  saveStoredWordPressSettings,
} from '@/lib/wordpress/client';

export const dynamic = 'force-dynamic';

/**
 * POST: Tests WordPress REST API connection.
 * If credentials provided in body, tests those; otherwise uses stored credentials.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { website_url, username, application_password } = body;

    let targetSettings = null;

    if (website_url && username) {
      const stored = await getStoredWordPressSettings();
      const pass = application_password && application_password.trim().length > 0
        ? application_password.trim()
        : stored?.application_password || '';

      targetSettings = {
        website_url,
        username,
        application_password: pass,
      };
    } else {
      targetSettings = await getStoredWordPressSettings();
    }

    if (!targetSettings || !targetSettings.website_url || !targetSettings.username || !targetSettings.application_password) {
      return NextResponse.json(
        {
          success: false,
          message: 'WordPress credentials not configured. Please specify Website URL, Username, and Application Password.',
        },
        { status: 400 }
      );
    }

    const result = await testWordPressConnection(targetSettings);

    // Update connection status in storage
    if (result.success) {
      try {
        await saveStoredWordPressSettings({
          ...targetSettings,
          is_connected: true,
        });
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Error in WordPress test connection:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        message: `Connection failed: ${msg}`,
      },
      { status: 500 }
    );
  }
}

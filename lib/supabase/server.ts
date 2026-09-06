import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { User } from '@supabase/supabase-js';

export interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Tariq Mansoor' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  email: 'demo@nursocial.ai',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

export async function getAuthUser(): Promise<{ user: User | null; isDemo: boolean; error: Error | null }> {
  try {
    const cookieStore = await cookies();
    const hasDemoCookie = cookieStore.get('nur_demo_session')?.value === 'true';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const isUnconfigured = !supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder-project') || supabaseKey.includes('placeholder');
    const isDemoExplicit = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    if (hasDemoCookie || isDemoExplicit || isUnconfigured) {
      return { user: DEMO_USER, isDemo: true, error: null };
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user) {
      return { user, isDemo: false, error: null };
    }

    if (error) {
      if (hasDemoCookie) {
        return { user: DEMO_USER, isDemo: true, error: null };
      }
      return { user: null, isDemo: false, error: new Error(error.message) };
    }

    return { user: null, isDemo: false, error: null };
  } catch (err: unknown) {
    return {
      user: null,
      isDemo: false,
      error: err instanceof Error ? err : new Error('Authentication check failed'),
    };
  }
}

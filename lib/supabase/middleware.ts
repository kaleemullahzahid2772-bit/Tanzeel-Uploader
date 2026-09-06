import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Check demo session cookie first
  const hasDemoAuth = request.cookies.get('nur_demo_session')?.value === 'true';

  if (hasDemoAuth) {
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // If unconfigured or demo mode explicitly active without cookie
  const isUnconfigured = supabaseUrl.includes('placeholder-project') || supabaseAnonKey.includes('placeholder');
  const isDemoExplicit = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isUnconfigured || isDemoExplicit) {
    if (isDashboardRoute && !hasDemoAuth) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Check if any Supabase auth token cookie is present
  const allCookies = request.cookies.getAll();
  const hasSupabaseCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  // If visiting dashboard with zero auth credentials (no demo cookie, no supabase token cookie)
  if (!hasSupabaseCookie && !hasDemoAuth && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Live Supabase Authentication Session Check
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user) {
      if (isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // If explicit auth error (e.g. invalid token) and no user
    if (!user && error && !hasDemoAuth && isDashboardRoute) {
      // If error is network related, allow browser to verify via client AuthContext
      const isNetworkError = error.message?.toLowerCase().includes('fetch') || error.message?.toLowerCase().includes('network');
      if (!isNetworkError && !hasSupabaseCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }
  } catch (err) {
    console.warn('[Nūr Middleware] Supabase verification notice:', err);
    // If there is no auth cookie at all, safely redirect to login
    if (!hasSupabaseCookie && !hasDemoAuth && isDashboardRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

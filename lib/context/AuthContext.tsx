'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile, BrandSettings, ContentPreferences } from '@/lib/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  brandSettings: BrandSettings | null;
  contentPreferences: ContentPreferences | null;
  loading: boolean;
  isDemoMode: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateBrandSettings: (data: Partial<BrandSettings>) => Promise<{ error: Error | null }>;
  updateContentPreferences: (data: Partial<ContentPreferences>) => Promise<{ error: Error | null }>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Demo User Profile for fallback
const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Tariq Mansoor' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@nursocial.ai',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEFAULT_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Tariq Mansoor',
  email: 'demo@nursocial.ai',
  avatar_url: null,
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  id: '00000000-0000-0000-0000-000000000002',
  user_id: '00000000-0000-0000-0000-000000000001',
  brand_name: 'Nūr Social',
  brand_description: 'Islamic ethical social media marketing & automated multi-platform distribution.',
  website: 'https://nursocial.ai',
  contact_email: 'contact@nursocial.ai',
  contact_phone: '+1 (555) 019-2834',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_CONTENT_PREFERENCES: ContentPreferences = {
  id: '00000000-0000-0000-0000-000000000003',
  user_id: '00000000-0000-0000-0000-000000000001',
  default_language: 'English',
  default_timezone: 'Asia/Dubai',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [contentPreferences, setContentPreferences] = useState<ContentPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const isConfigured = isSupabaseConfigured();
  const isDemoExplicit = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const [isDemoMode, setIsDemoMode] = useState(!isConfigured || isDemoExplicit);

  const supabase = createClient();
  const isMountedRef = useRef(true);

  const loadUserData = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      } else {
        const u = currentUser;
        setProfile({
          id: userId,
          user_id: userId,
          full_name: u?.user_metadata?.full_name || u?.email?.split('@')[0] || 'User',
          email: u?.email || '',
          avatar_url: null,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // 2. Fetch Brand Settings
      const { data: brandData } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (brandData) setBrandSettings(brandData);

      // 3. Fetch Content Preferences
      const { data: prefData } = await supabase
        .from('content_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (prefData) setContentPreferences(prefData);
    } catch (err) {
      console.warn('Error loading user data from Supabase:', err);
    }
  }, [supabase]);

  const refreshData = useCallback(async () => {
    if (isDemoMode) {
      const savedProfile = localStorage.getItem('nur_demo_profile');
      const savedBrand = localStorage.getItem('nur_demo_brand');
      const savedPrefs = localStorage.getItem('nur_demo_prefs');

      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedBrand) setBrandSettings(JSON.parse(savedBrand));
      if (savedPrefs) setContentPreferences(JSON.parse(savedPrefs));
    } else if (user) {
      await loadUserData(user.id, user);
    }
  }, [isDemoMode, user, loadUserData]);

  useEffect(() => {
    isMountedRef.current = true;

    const initAuth = async () => {
      // Check if demo cookie exists
      const demoAuthCookie = typeof document !== 'undefined' && document.cookie.includes('nur_demo_session=true');
      if (demoAuthCookie) {
        setUser(DEMO_USER);
        const savedProfile = localStorage.getItem('nur_demo_profile');
        const savedBrand = localStorage.getItem('nur_demo_brand');
        const savedPrefs = localStorage.getItem('nur_demo_prefs');

        setProfile(savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE);
        setBrandSettings(savedBrand ? JSON.parse(savedBrand) : DEFAULT_BRAND_SETTINGS);
        setContentPreferences(savedPrefs ? JSON.parse(savedPrefs) : DEFAULT_CONTENT_PREFERENCES);
        setIsDemoMode(true);
        if (isMountedRef.current) setLoading(false);
        return;
      }

      if (!isConfigured || isDemoExplicit) {
        if (isMountedRef.current) setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMountedRef.current) {
          setUser(session.user);
          setIsDemoMode(false);
          await loadUserData(session.user.id, session.user);
        }
      } catch (err) {
        console.warn('[Nūr Auth] Session initialization notice:', err);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    initAuth();

    if (isConfigured && !isDemoExplicit) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMountedRef.current) return;
        console.log('[Nūr Auth] Auth state change event:', event, session?.user?.email ? '(user present)' : '(no user)');

        if (session?.user) {
          setUser(session.user);
          setIsDemoMode(false);
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
            await loadUserData(session.user.id, session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          const demoCookie = typeof document !== 'undefined' && document.cookie.includes('nur_demo_session=true');
          if (!demoCookie) {
            setUser(null);
            setProfile(null);
            setBrandSettings(null);
            setContentPreferences(null);
          }
        }
        setLoading(false);
      });

      return () => {
        isMountedRef.current = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [isConfigured, isDemoExplicit, supabase, loadUserData]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; user?: User | null }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if demo sign-in is requested
    if (!isConfigured || cleanEmail === 'demo@nursocial.ai' || password === 'demo1234') {
      document.cookie = 'nur_demo_session=true; path=/; max-age=86400; SameSite=Lax';
      setUser(DEMO_USER);
      setProfile(DEFAULT_PROFILE);
      setBrandSettings(DEFAULT_BRAND_SETTINGS);
      setContentPreferences(DEFAULT_CONTENT_PREFERENCES);
      setIsDemoMode(true);
      return { error: null, user: DEMO_USER };
    }

    try {
      console.log('[Nūr Auth] Initiating Supabase signInWithPassword for:', cleanEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.warn('[Nūr Auth] Supabase sign-in error:', error.message, 'Status:', error.status);
        return { error: new Error(error.message) };
      }

      if (data?.user) {
        console.log('[Nūr Auth] Supabase sign-in verified for:', data.user.email);
        document.cookie = 'nur_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(data.user);
        setIsDemoMode(false);
        // Load additional profile metadata non-blockingly
        loadUserData(data.user.id, data.user).catch((err) => {
          console.warn('[Nūr Auth] Profile load warning:', err);
        });
        return { error: null, user: data.user };
      }

      return { error: new Error('No user data returned from authentication.') };
    } catch (err: unknown) {
      console.error('[Nūr Auth] Unexpected signIn exception:', err);
      return { error: err instanceof Error ? err : new Error('Failed to sign in') };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: Error | null; needsConfirmation?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isConfigured) {
      const customDemoUser: User = {
        ...DEMO_USER,
        email: cleanEmail,
        user_metadata: { full_name: fullName.trim() },
      };
      const customProfile: Profile = {
        ...DEFAULT_PROFILE,
        full_name: fullName.trim(),
        email: cleanEmail,
      };
      document.cookie = 'nur_demo_session=true; path=/; max-age=86400; SameSite=Lax';
      localStorage.setItem('nur_demo_profile', JSON.stringify(customProfile));
      setUser(customDemoUser);
      setProfile(customProfile);
      setBrandSettings(DEFAULT_BRAND_SETTINGS);
      setContentPreferences(DEFAULT_CONTENT_PREFERENCES);
      setIsDemoMode(true);
      return { error: null, needsConfirmation: false };
    }

    try {
      console.log('[Nūr Auth] Initiating Supabase signUp for:', cleanEmail);
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        console.warn('[Nūr Auth] Supabase signUp error:', error.message);
        return { error: new Error(error.message) };
      }

      if (data.user && !data.session) {
        console.log('[Nūr Auth] Supabase signUp created user, confirmation required.');
        return { error: null, needsConfirmation: true };
      }

      if (data?.user) {
        console.log('[Nūr Auth] Supabase signUp created active session.');
        document.cookie = 'nur_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(data.user);
        setIsDemoMode(false);
        loadUserData(data.user.id, data.user).catch((err) => {
          console.warn('[Nūr Auth] Post-signup profile load warning:', err);
        });
      }

      return { error: null, needsConfirmation: false };
    } catch (err: unknown) {
      console.error('[Nūr Auth] Unexpected signUp exception:', err);
      return { error: err instanceof Error ? err : new Error('Failed to create account') };
    }
  };

  const signOut = async () => {
    document.cookie = 'nur_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    if (isConfigured && !isDemoMode) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setProfile(null);
    setBrandSettings(null);
    setContentPreferences(null);
    setIsDemoMode(false);
  };

  const updateProfile = async (data: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (isDemoMode || !user) {
      const updated = { ...profile, ...data } as Profile;
      setProfile(updated);
      localStorage.setItem('nur_demo_profile', JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) return { error: new Error(error.message) };
      await loadUserData(user.id, user);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update profile') };
    }
  };

  const updateBrandSettings = async (data: Partial<BrandSettings>): Promise<{ error: Error | null }> => {
    if (isDemoMode || !user) {
      const updated = { ...brandSettings, ...data } as BrandSettings;
      setBrandSettings(updated);
      localStorage.setItem('nur_demo_brand', JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('brand_settings')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) return { error: new Error(error.message) };
      await loadUserData(user.id, user);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update brand settings') };
    }
  };

  const updateContentPreferences = async (data: Partial<ContentPreferences>): Promise<{ error: Error | null }> => {
    if (isDemoMode || !user) {
      const updated = { ...contentPreferences, ...data } as ContentPreferences;
      setContentPreferences(updated);
      localStorage.setItem('nur_demo_prefs', JSON.stringify(updated));
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('content_preferences')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) return { error: new Error(error.message) };
      await loadUserData(user.id, user);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Failed to update content preferences') };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        brandSettings,
        contentPreferences,
        loading,
        isDemoMode,
        isConfigured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateBrandSettings,
        updateContentPreferences,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

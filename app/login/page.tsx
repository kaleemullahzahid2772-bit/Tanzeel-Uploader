'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { IslamicPattern, IslamicCornerAccents } from '@/components/islamic/IslamicPattern';
import { IslamicDivider } from '@/components/islamic/IslamicDivider';
import { BrandMark } from '@/components/islamic/BrandMark';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, AlertCircle, Sparkles, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();
  const isDemoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email درج کرنا ضروری ہے (Email is required)';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'درست Email ایڈریس درج کریں (Please enter a valid email address)';
    }

    if (!password) {
      errors.password = 'Password درج کرنا ضروری ہے (Password is required)';
    } else if (password.length < 6) {
      errors.password = 'Password کم از کم 6 حروف کا ہونا چاہیے (Password must be at least 6 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { error: signInError, user } = await signIn(email, password);

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
          setError('Email یا Password درست نہیں ہے۔ اگر آپ نے نیا پروجیکٹ بنایا ہے تو پہلے "Sign Up" کے ذریعے اکاؤنٹ بنائیں۔');
        } else if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
          setError('آپ کا Email ابھی verify نہیں ہوا۔ براہ کرم اپنی email میں verification link چیک کریں یا Supabase Auth Settings میں "Confirm email" بند کریں۔');
        } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
          setError('بہت زیادہ کوششیں کی گئیں۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔');
        } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
          setError('Server یا Internet کنکشن سے رابطے میں مسئلہ ہے۔ براہ کرم انٹرنیٹ کنکشن چیک کر کے دوبارہ کوشش کریں۔');
        } else {
          setError(signInError.message || 'Sign in کرتے وقت ایک غیر متوقع مسئلہ پیش آیا۔');
        }
        setLoading(false);
        return;
      }

      // Successful sign in
      if (user) {
        router.replace('/dashboard');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Sign in کرتے وقت ایک غیر متوقع مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔');
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    setResendStatus(null);
    try {
      const { error: demoError } = await signIn('demo@nursocial.ai', 'demo1234');
      if (demoError) {
        setError(demoError.message);
        setLoading(false);
      } else {
        router.replace('/dashboard');
      }
    } catch {
      setError('Failed to initiate demo session.');
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setFormErrors({ email: 'Please enter your email address first' });
      return;
    }
    setResendingEmail(true);
    setResendStatus(null);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (resendErr) {
        setResendStatus(`Resend failed: ${resendErr.message}`);
      } else {
        setResendStatus('تصدیقی ای میل دوبارہ بھیج دی گئی ہے! براہ کرم اپنا ان باکس اور سپیم فولڈر چیک کریں۔');
      }
    } catch {
      setResendStatus('Verification email resend failed. Please try again.');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-sand-ivory flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle Vector Background */}
      <IslamicPattern variant="subtle" opacity={0.045} />

      <div className="relative w-full max-w-md z-10">
        {/* Main Card */}
        <div className="relative bg-sand-ivory/95 backdrop-blur-md rounded-2xl border border-sand-border shadow-elevated p-8 sm:p-10 overflow-hidden">
          <IslamicCornerAccents />

          {/* Top Gold Trim Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-primary via-gold-primary to-emerald-dark" />

          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <BrandMark size="lg" showSubtitle={false} />

            <div className="flex items-center gap-1.5 mt-2 text-gold-primary text-xs font-serif font-medium">
              <span>✦</span>
              <span className="text-emerald-deep font-sans tracking-wide">
                AI-Powered Social Media Management
              </span>
              <span>✦</span>
            </div>

            <p className="text-xs text-charcoal-muted mt-2">
              Sign in to your Islamic content management dashboard
            </p>
          </div>

          <IslamicDivider variant="gold" className="my-6" />

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-700 text-xs animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>

              {/* Show Resend Verification Action if error is about email verification */}
              {(error.includes('verify') || error.includes('confirm')) && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail}
                    className="text-[11px] font-semibold text-rose-800 hover:text-rose-950 underline underline-offset-2 transition-colors disabled:opacity-50"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email (تصدیقی ای میل دوبارہ بھیجیں)'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Resend Status Banner */}
          {resendStatus && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs animate-fadeIn leading-relaxed">
              {resendStatus}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
              }}
              error={formErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
              }}
              error={formErrors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Direct Sign Up suggestion */}
          <div className="mt-4 pt-3 border-t border-sand-border/50 text-center">
            <Link href="/signup">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                leftIcon={<UserPlus className="w-3.5 h-3.5 text-emerald-primary" />}
              >
                Create a New Account (Sign Up)
              </Button>
            </Link>
          </div>

          {/* Sandbox Demo Helper (Shown only when demo mode is active or unconfigured) */}
          {(isDemoModeEnabled || !isConfigured) && (
            <div className="mt-4 pt-3 border-t border-sand-border/50 text-center">
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-gold-deep hover:text-gold-dark font-medium bg-gold-subtle/80 hover:bg-gold-subtle px-3 py-1.5 rounded-lg border border-gold-border/50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-primary" />
                <span>Instant Sandbox Demo Access</span>
              </button>
            </div>
          )}

          {/* Motto */}
          <div className="mt-6 pt-4 border-t border-sand-border/40 text-center text-[10px] uppercase font-mono tracking-widest text-charcoal-light">
            Secure • Professional • Intelligent
          </div>
        </div>
      </div>
    </div>
  );
}

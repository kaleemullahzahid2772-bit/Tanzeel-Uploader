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
import { User, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errors: typeof formErrors = {};

    if (!fullName.trim()) {
      errors.fullName = 'پورا نام درج کرنا ضروری ہے (Full name is required)';
    }

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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'پاس ورڈ ایک جیسے نہیں ہیں (Passwords do not match)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmedMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { error: signUpError, needsConfirmation } = await signUp(email, password, fullName);
      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes('user already registered') || msg.includes('already exists')) {
          setError('یہ Email پہلے سے رجسٹرڈ ہے۔ براہ کرم Sign In کریں۔ (User already exists, please Sign In)');
        } else if (msg.includes('password should be at least')) {
          setError('Password کم از کم 6 حروف کا ہونا چاہیے۔');
        } else if (msg.includes('invalid') && msg.includes('email')) {
          setError('ای میل ایڈریس درست نہیں ہے۔ براہ کرم قابل قبول ای میل درج کریں۔');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
      } else if (needsConfirmation) {
        setConfirmedMessage(
          `اکاؤنٹ کامیابی سے بن گیا ہے (${email})! تصدیقی لنک آپ کے ای میل پر بھیج دیا گیا ہے۔ براہ کرم اپنی ای میل میں تصدیقی لنک پر کلک کریں (یا فوری لاگ ان کے لیے Supabase سیٹنگز میں "Confirm email" بند کریں)۔`
        );
        setLoading(false);
      } else {
        router.replace('/dashboard');
      }
    } catch {
      setError('اکاؤنٹ بناتے وقت ایک غیر متوقع مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔');
      setLoading(false);
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
                Join Nūr Social
              </span>
              <span>✦</span>
            </div>

            <p className="text-xs text-charcoal-muted mt-2">
              Create your account to start managing Islamic social content
            </p>
          </div>

          <IslamicDivider variant="gold" className="my-6" />

          {/* Success Message Banner */}
          {confirmedMessage && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-emerald-800 text-xs animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="font-medium leading-relaxed">{confirmedMessage}</div>
              </div>
              <div className="pt-2 border-t border-emerald-200/60 flex justify-end">
                <Link href="/login">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Sign Up Form */}
          {!confirmedMessage && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Tariq Mansoor"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                }}
                error={formErrors.fullName}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                }}
                error={formErrors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: undefined });
                }}
                error={formErrors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
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
                  Create Account
                </Button>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-charcoal-muted">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="font-semibold text-emerald-primary hover:text-emerald-dark underline decoration-gold-primary/50 underline-offset-2"
            >
              Sign In
            </Link>
          </div>

          {/* Motto */}
          <div className="mt-6 pt-4 border-t border-sand-border/40 text-center text-[10px] uppercase font-mono tracking-widest text-charcoal-light">
            Secure • Professional • Intelligent
          </div>
        </div>
      </div>
    </div>
  );
}

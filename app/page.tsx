'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { BrandMark } from '@/components/islamic/BrandMark';
import { IslamicPattern, IslamicCornerAccents } from '@/components/islamic/IslamicPattern';
import { IslamicDivider } from '@/components/islamic/IslamicDivider';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="relative min-h-screen bg-sand-ivory flex flex-col justify-between overflow-hidden">
      {/* Background Vector Pattern */}
      <IslamicPattern variant="subtle" opacity={0.035} />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandMark size="lg" />

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 bg-sand-muted animate-pulse rounded-lg" />
          ) : user ? (
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gold" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-20 text-center flex flex-col items-center">
        {/* Subtle Islamic Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-subtle/80 border border-emerald-border/40 text-emerald-primary text-xs font-medium mb-6 shadow-xs animate-fadeIn">
          <span className="text-gold-primary text-xs">✦</span>
          <span>Phase 1 • Modern SaaS + Islamic Elegance</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-primary animate-pulse" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-emerald-deep leading-[1.15] max-w-3xl">
          Intelligent Social Media Management for Islamic Brands
        </h1>

        <p className="text-sm sm:text-base text-charcoal-muted mt-5 max-w-2xl leading-relaxed">
          Upload your media once. Nūr Social provides a modern, secure foundation to organize digital assets, draft content, and prepare multi-channel distribution.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={user ? '/dashboard' : '/login'}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Sparkles className="w-4 h-4 text-gold-light" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {user ? 'Enter Dashboard' : 'Open Dashboard'}
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" size="lg">
              Create New Account
            </Button>
          </Link>
        </div>

        <IslamicDivider className="w-48 my-12" variant="gold" />

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left w-full mt-2">
          {/* Card 1 */}
          <div className="relative bg-sand-cream/70 rounded-2xl p-6 border border-sand-border/80 shadow-subtle hover:border-emerald-primary/40 transition-all">
            <IslamicCornerAccents />
            <div className="w-10 h-10 rounded-xl bg-emerald-subtle text-emerald-primary flex items-center justify-center mb-4 border border-emerald-border/30">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-emerald-deep">
              Media Hub
            </h3>
            <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
              Upload and manage JPG, PNG, WEBP, MP4, and MOV files backed by Supabase Storage and PostgreSQL.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative bg-sand-cream/70 rounded-2xl p-6 border border-sand-border/80 shadow-subtle hover:border-gold-primary/40 transition-all">
            <IslamicCornerAccents />
            <div className="w-10 h-10 rounded-xl bg-gold-subtle text-gold-deep flex items-center justify-center mb-4 border border-gold-border/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-emerald-deep">
              Row-Level Security
            </h3>
            <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
              Strict multi-tenant security architecture ensuring isolated user profiles, storage, and draft privacy.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative bg-sand-cream/70 rounded-2xl p-6 border border-sand-border/80 shadow-subtle hover:border-emerald-primary/40 transition-all">
            <IslamicCornerAccents />
            <div className="w-10 h-10 rounded-xl bg-emerald-subtle text-emerald-primary flex items-center justify-center mb-4 border border-emerald-border/30">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-emerald-deep">
              Islamic SaaS Design
            </h3>
            <p className="text-xs text-charcoal-muted mt-1.5 leading-relaxed">
              Carefully curated deep emerald, rich gold, and warm ivory palette with subtle geometric Khatam accents.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sand-border/70 py-6 text-center text-xs text-charcoal-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Nūr Social. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Next.js 15</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

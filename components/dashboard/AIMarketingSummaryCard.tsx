'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import { AIMarketingOverview } from '@/lib/types/database';

export function AIMarketingSummaryCard() {
  const [overview, setOverview] = useState<AIMarketingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch('/api/marketing/overview');
        if (res.ok) {
          const data = await res.json();
          if (data.overview) setOverview(data.overview);
        }
      } catch {
        // Ignore in dashboard summary
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) return null;

  const bestTopic = overview?.bestTopic;
  const bestPlat = overview?.bestPlatform;
  const score = overview?.healthScore?.overallScore || 75;

  return (
    <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 border border-sand-border dark:border-emerald-800/30 shadow-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 opacity-5 pointer-events-none text-gold-deep">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 7.5L20 7.5L16.5 12L20 16.5L14.5 16.5L12 22L9.5 16.5L4 16.5L7.5 12L4 7.5L9.5 7.5Z" />
        </svg>
      </div>

      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-emerald-light/20 text-emerald-deep dark:text-emerald-light border border-emerald-light/40 shrink-0 mt-0.5">
          <Sparkles className="w-6 h-6 text-gold-deep" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-gold-subtle text-gold-deep border border-gold-border">
              Phase 8 • Marketing Intelligence
            </span>
            <span className="text-xs font-mono font-bold text-emerald-primary">
              Health Score: {score}/100
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-emerald-deep dark:text-white">
            {bestTopic
              ? `Strongest Content Resonance: "${bestTopic}"`
              : 'AI Marketing Strategist is Active'}
          </h3>

          <p className="text-xs text-charcoal-muted dark:text-gray-300 mt-1 font-urdu leading-relaxed max-w-xl">
            {bestTopic
              ? `آپ کے حالیہ ڈیٹا کے مطابق "${bestTopic}" پر شائع کردہ مواد کا ردعمل سب سے بہتر ہے۔ ${bestPlat ? `${bestPlat.toUpperCase()} آپ کا بنیادی نامیاتی چینل ہے۔` : ''}`
              : 'اپنے لائیو اینالیٹکس، 7 روزہ کنٹینٹ پلان، اور خودکار آئیڈیاز کے لیے مارکیٹنگ ڈیش بورڈ وزٹ کریں۔'}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <Link
          href="/dashboard/ai-marketing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-all shadow-sm"
        >
          <span>Open AI Marketing Manager</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

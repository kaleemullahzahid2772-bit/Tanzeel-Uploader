'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Share2, PlusSquare, BarChart3, ShieldCheck } from 'lucide-react';

export function EmptyMarketingState() {
  return (
    <div className="bg-sand-ivory dark:bg-[#0F1715] rounded-3xl p-8 sm:p-12 border border-sand-border dark:border-emerald-800/30 text-center space-y-6 shadow-card max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-3xl bg-emerald-light/20 text-emerald-deep dark:text-emerald-light border border-emerald-light/40 flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-emerald-deep dark:text-white">
          Unlock AI Marketing Intelligence
        </h2>
        <p className="text-sm text-charcoal-muted dark:text-gray-300 font-urdu max-w-md mx-auto leading-relaxed">
          اپنے سوشل اکاؤنٹس منسلک کریں اور پہلی پوسٹ شائع کریں تاکہ AI مارکیٹنگ مینیجر آپ کے سامعین کے ردعمل کی بنیاد پر حقیقی اور کارآمد حکمتِ عملی تیار کر سکے۔
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-sand-muted dark:bg-[#15231F] border border-sand-border/80 text-xs text-charcoal-light dark:text-gray-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Nūr Social strictly uses genuine analytics data — no fabricated or synthetic numbers.</span>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-3 pt-2">
        <Link
          href="/dashboard/accounts"
          className="px-5 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Connect Social Accounts</span>
        </Link>

        <Link
          href="/dashboard/create-post"
          className="px-5 py-2.5 rounded-xl border border-sand-border dark:border-emerald-800/40 bg-sand-card dark:bg-[#15231F] text-charcoal-deep dark:text-white text-xs font-semibold hover:bg-sand-muted transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusSquare className="w-4 h-4 text-emerald-primary" />
          <span>Create First Post</span>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="px-5 py-2.5 rounded-xl border border-sand-border dark:border-emerald-800/40 bg-sand-card dark:bg-[#15231F] text-charcoal-deep dark:text-white text-xs font-semibold hover:bg-sand-muted transition-colors flex items-center gap-2 shadow-sm"
        >
          <BarChart3 className="w-4 h-4 text-gold-deep" />
          <span>View Analytics</span>
        </Link>
      </div>
    </div>
  );
}

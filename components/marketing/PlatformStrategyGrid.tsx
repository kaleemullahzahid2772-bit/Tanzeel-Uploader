'use client';

import React from 'react';
import { SocialPlatform } from '@/lib/types/database';
import { Share2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { SocialIcon } from '@/components/ai/SocialIcons';

interface PlatformStrategyGridProps {
  connectedPlatforms: SocialPlatform[];
}

const PLATFORM_STRATEGIES: Record<SocialPlatform, {
  name: string;
  working: string[];
  improve: string[];
  recommendedFormat: string;
}> = {
  facebook: {
    name: 'Facebook',
    working: ['تفصیلی اسلامی آرٹیکلز اور دعائیہ پوسٹس', 'خاندانی تربیت اور والدین کے لیے رہنمائی'],
    improve: ['پوسٹ کے اختتام پر سوالات شامل کریں تاکہ کمنٹس بڑھیں', 'ہفتہ وار کم از کم 1 لائیو یا ویڈیو پوسٹ کریں'],
    recommendedFormat: 'High-resolution Infographic + Comprehensive reflection',
  },
  instagram: {
    name: 'Instagram',
    working: ['60 سیکنڈ سے کم مختصر اسلامی ریلز', 'تین تا چار سلائیڈز کے کاروسیل (Carousel) کارڈز'],
    improve: ['پہلے 3 سیکنڈ کا ہوک (Hook) زیادہ موثر بنائیں', 'اسلامی اسٹوریز میں پولز (Polls) کا استعمال کریں'],
    recommendedFormat: 'Carousel Infographic (1080x1350) + Reels',
  },
  tiktok: {
    name: 'TikTok',
    working: ['تیز رفتار 30-45 سیکنڈ کے فکری و مسنون اسباق', 'آن اسکرین ٹیکسٹ اور واضح آواز'],
    improve: ['پہلی سطر میں مضبوط تجسس یا سوال پیدا کریں', 'مقبول و باوقار اسلامی آڈیوز کا انتخاب کریں'],
    recommendedFormat: '9:16 Vertical Video with Bold Subtitles',
  },
  youtube: {
    name: 'YouTube',
    working: ['جامع بیانات اور تفسیری لیکچرز', 'سرچ پر مبنی ٹائٹلز اور واضح چیپٹرز'],
    improve: ['یوٹیوب شارٹس کا باقاعدہ استعمال شروع کریں', 'ویڈیو تھمب نیل پر واضح اور پرکشش فونٹ لگائیں'],
    recommendedFormat: '16:9 Long Form (5-10 mins) + YouTube Shorts',
  },
  twitter: {
    name: 'X (Twitter)',
    working: ['مختصر اقوال اور فکر انگیز جملے', 'حدیث شریف کا مستند ترجمہ مع حوالہ'],
    improve: ['تھریڈز (Threads) کی شکل میں تفصیلی بات بیان کریں', 'موضوع سے متعلق صرف 2-3 ہیش ٹیگز لگائیں'],
    recommendedFormat: 'Punchy 280-char Thread + Clean Quote Image',
  },
  whatsapp: {
    name: 'WhatsApp Channels',
    working: ['روزمرہ صبح کے مسنون اذکار', 'جمعہ مبارک کے خصوصی پیغامات'],
    improve: ['پیغامات کے فارمیٹنگ کو آسان اور واضح رکھیں', 'ضروری اعلانات اور لنکس کو نمایاں کریں'],
    recommendedFormat: 'Clear Bulleted Text + 1:1 Image Graphic',
  },
};

export function PlatformStrategyGrid({ connectedPlatforms }: PlatformStrategyGridProps) {
  const allPlatforms: SocialPlatform[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp'];

  return (
    <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-6">
      <div className="border-b border-sand-border/60 pb-5">
        <h3 className="text-lg font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-primary" />
          Individual Platform Playbooks & Strategy
        </h3>
        <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
          ہر منسلک سوشل میڈیا پلیٹ فارم کے لیے خصوصی گائیڈ اور فارمیٹ گائیڈ لائنز
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPlatforms.map((plat) => {
          const isConnected = connectedPlatforms.includes(plat);
          const strat = PLATFORM_STRATEGIES[plat];

          return (
            <div
              key={plat}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isConnected
                  ? 'bg-sand-card dark:bg-[#15231F] border-sand-border/80 dark:border-emerald-800/20 shadow-sm'
                  : 'bg-sand-muted/40 dark:bg-emerald-950/10 border-dashed border-sand-border/80 dark:border-emerald-900/30 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <SocialIcon platform={plat} className="w-5 h-5" />
                    <h4 className="text-sm font-bold text-emerald-deep dark:text-white">
                      {strat.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      isConnected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Limited Data'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase font-mono text-emerald-primary block mb-1">
                      ✓ What is Working:
                    </span>
                    <ul className="space-y-1 font-urdu text-charcoal-deep dark:text-gray-300">
                      {strat.working.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase font-mono text-gold-deep block mb-1">
                      ⚡ What to Improve:
                    </span>
                    <ul className="space-y-1 font-urdu text-charcoal-deep dark:text-gray-300">
                      {strat.improve.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-gold-deep font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-sand-border/40 text-[11px]">
                <span className="text-charcoal-light dark:text-gray-400 font-mono block text-[10px] uppercase">
                  Recommended Format:
                </span>
                <span className="font-semibold text-emerald-deep dark:text-white">
                  {strat.recommendedFormat}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

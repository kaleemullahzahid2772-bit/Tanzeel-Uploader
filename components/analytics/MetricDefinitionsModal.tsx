'use client';

import React from 'react';
import { X, BookOpen, ShieldCheck } from 'lucide-react';
import { METRIC_DEFINITIONS } from '@/lib/analytics/normalizer';

interface MetricDefinitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MetricDefinitionsModal({ isOpen, onClose }: MetricDefinitionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121E19] border border-emerald-900/20 dark:border-emerald-700/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Official Metrics Glossary & Transparency
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-urdu">
              اینالیٹکس میٹرکس کی تعریفیں اور شفاف فارمولے
            </p>
          </div>
        </div>

        {/* Strict No-Fake-Metrics Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 mb-6">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Strict Authentic Data Grounding Policy (صداقت اور شفافیت کا ضابطہ):</p>
            <p className="text-emerald-800/90 dark:text-emerald-300/80">
              نُور سوشل میں کوئی تخمینہ یا جعلی میٹرک نہیں دکھایا جاتا۔ تمام اعداد و شمار براہ راست منسلک سوشل پلیٹ فارمز (Meta, YouTube, X, TikTok) کے آفیشل APIs سے حاصل کیے جاتے ہیں۔ اگر کوئی پلیٹ فارم کسی میٹرک کا ڈیٹا فراہم نہ کرے تو اسے صفر فرض کرنے کی بجائے "API Data Unavailable" ظاہر کیا جاتا ہے۔
            </p>
          </div>
        </div>

        {/* Definitions List */}
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
          {Object.entries(METRIC_DEFINITIONS).map(([key, def]) => (
            <div
              key={key}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-[#172721] border border-gray-100 dark:border-emerald-800/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 dark:text-emerald-200">
                  {def.titleEn}
                </h4>
                <span className="text-xs font-urdu text-amber-700 dark:text-amber-400 font-medium">
                  {def.titleUr}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {def.descriptionEn}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu leading-relaxed">
                {def.descriptionUr}
              </p>
              {def.formula && (
                <div className="pt-1 text-[11px] font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                  Formula: {def.formula}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-emerald-900/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-medium text-sm hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20"
          >
            I Understand (سمجھ گیا)
          </button>
        </div>
      </div>
    </div>
  );
}

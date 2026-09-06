'use client';

import React, { useState } from 'react';
import { FileText, X, Download, ShieldCheck, Sparkles } from 'lucide-react';

interface MarketingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketingReportModal({ isOpen, onClose }: MarketingReportModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    setDownloading(true);
    window.location.href = '/api/marketing/report?format=csv';
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-deep/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-sand-ivory dark:bg-[#0F1715] rounded-3xl shadow-2xl border border-sand-border dark:border-emerald-800/30 overflow-hidden">
        <div className="p-5 border-b border-sand-border/80 flex items-center justify-between bg-sand-card dark:bg-[#15231F]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-deep text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-deep dark:text-white">
                Executive Marketing Strategy Report
              </h4>
              <p className="text-[11px] text-charcoal-muted dark:text-gray-400 font-urdu">
                مکمل تجزیاتی رپورٹ برائے قیادت و حکمت عملی
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-charcoal-muted hover:text-charcoal-deep rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-charcoal-deep dark:text-gray-300 font-urdu leading-relaxed">
            یہ ایگزیکٹو رپورٹ آپ کے تمام منسلک سوشل میڈیا پلیٹ فارمز، تصدیق شدہ اینالیٹکس، بہترین کارکردگی والے موضوعات اور اگلے 7 دن کی اسٹریٹجی کا مکمل خلاصہ فراہم کرتی ہے۔
          </p>

          <div className="p-4 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 space-y-2">
            <div className="font-bold text-emerald-deep dark:text-white">Report Content Includes:</div>
            <ul className="list-disc list-inside space-y-1 text-charcoal-muted dark:text-gray-400">
              <li>Verified Audience Engagement & Reach Summary</li>
              <li>Top Performing Content Patterns</li>
              <li>Platform Priority Recommendations</li>
              <li>Next 7-Day Strategy Schedule</li>
              <li>Data-Grounding Verification Statement</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={downloading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Exporting CSV...' : 'Download CSV Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Check, 
  Share2, 
  Layers
} from 'lucide-react';
import { DateRangePreset, SocialPlatform } from '@/lib/types/database';

export interface DateFilterState {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
  platform?: SocialPlatform | 'all';
  accountId?: string;
}

interface DateRangePickerProps {
  filters: DateFilterState;
  onChange: (filters: DateFilterState) => void;
  accounts?: Array<{ id: string; platform: SocialPlatform; account_name: string; account_username?: string }>;
  disabled?: boolean;
}

const PRESETS: Array<{ id: DateRangePreset; label: string; urduLabel: string }> = [
  { id: 'today', label: 'Today', urduLabel: 'آج' },
  { id: 'yesterday', label: 'Yesterday', urduLabel: 'گزشتہ کل' },
  { id: 'last_7d', label: 'Last 7 Days', urduLabel: 'گزشتہ 7 دن' },
  { id: 'last_30d', label: 'Last 30 Days', urduLabel: 'گزشتہ 30 دن' },
  { id: 'last_90d', label: 'Last 90 Days', urduLabel: 'گزشتہ 90 دن' },
  { id: 'this_month', label: 'This Month', urduLabel: 'موجودہ مہینہ' },
  { id: 'previous_month', label: 'Previous Month', urduLabel: 'پچھلا مہینہ' },
  { id: 'custom', label: 'Custom Range', urduLabel: 'اپنی مرضی کی تاریخ' },
];

const PLATFORMS: Array<{ id: SocialPlatform | 'all'; label: string }> = [
  { id: 'all', label: 'All Platforms (تمام پلیٹ فارمز)' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitter', label: 'X (Twitter)' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

export function DateRangePicker({ filters, onChange, accounts = [], disabled = false }: DateRangePickerProps) {
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(filters.startDate || '');
  const [customEnd, setCustomEnd] = useState(filters.endDate || '');

  const activePreset = PRESETS.find(p => p.id === filters.preset) || PRESETS[3];

  const handlePresetSelect = (preset: DateRangePreset) => {
    setShowPresetDropdown(false);
    if (preset === 'custom') {
      setShowCustomModal(true);
    } else {
      onChange({
        ...filters,
        preset,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return;
    setShowCustomModal(false);
    onChange({
      ...filters,
      preset: 'custom',
      startDate: customStart,
      endDate: customEnd,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-white dark:bg-[#111C18] p-3.5 rounded-2xl border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Preset Selector */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-sm font-medium border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100/70 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{activePreset.label}</span>
            <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">({activePreset.urduLabel})</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 text-emerald-600" />
          </button>

          {showPresetDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#162520] border border-emerald-900/10 dark:border-emerald-800/30 rounded-xl shadow-xl z-30 py-1.5 backdrop-blur-md">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-800 dark:text-gray-200"
                >
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-urdu">{p.urduLabel}</div>
                  </div>
                  {filters.preset === p.id && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select
            value={filters.platform || 'all'}
            disabled={disabled}
            onChange={(e) => onChange({ ...filters, platform: e.target.value as SocialPlatform | 'all', accountId: undefined })}
            aria-label="Filter by Platform"
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#162520] text-gray-800 dark:text-gray-200 text-sm border border-gray-200 dark:border-emerald-800/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Specific Account Filter */}
        {accounts.length > 0 && (
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={filters.accountId || ''}
              disabled={disabled}
              onChange={(e) => onChange({ ...filters, accountId: e.target.value || undefined })}
              aria-label="Filter by Connected Account"
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#162520] text-gray-800 dark:text-gray-200 text-sm border border-gray-200 dark:border-emerald-800/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
            >
              <option value="">All Connected Accounts (تمام اکاؤنٹس)</option>
              {accounts
                .filter(acc => !filters.platform || filters.platform === 'all' || acc.platform === filters.platform)
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.platform.toUpperCase()} — {acc.account_name} {acc.account_username ? '(' + acc.account_username + ')' : ''}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Display Active Date Range */}
      {filters.startDate && filters.endDate && (
        <div className="text-xs text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
          {filters.startDate} – {filters.endDate}
        </div>
      )}

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#14221D] rounded-2xl p-6 max-w-md w-full border border-emerald-900/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              Select Custom Date Range
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              اپنی مرضی کی تاریخیں منتخب کریں جن کا اینالیٹکس ڈیٹا آپ دیکھنا چاہتے ہیں۔
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Start Date (آغاز کی تاریخ)
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1A2D26] border border-gray-200 dark:border-emerald-800/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  End Date (اختتام کی تاریخ)
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1A2D26] border border-gray-200 dark:border-emerald-800/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-emerald-900/30">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-emerald-900/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-md shadow-emerald-900/20"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

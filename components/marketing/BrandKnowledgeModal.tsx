'use client';

import React, { useState, useEffect } from 'react';
import { BrandKnowledge, MarketingGoal } from '@/lib/types/database';
import { BookOpen, X, Save, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface BrandKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKnowledge: Partial<BrandKnowledge> | null;
  onSaved: (updated: BrandKnowledge) => void;
}

export function BrandKnowledgeModal({
  isOpen,
  onClose,
  brandKnowledge,
  onSaved,
}: BrandKnowledgeModalProps) {
  const [formData, setFormData] = useState<Partial<BrandKnowledge>>({
    brand_name: '',
    description: '',
    target_audience: '',
    services: '',
    products_courses: '',
    brand_voice: 'dignified_spiritual',
    preferred_language: 'Urdu',
    primary_goal: 'increase_engagement',
    keywords: [],
    forbidden_keywords: [],
    islamic_guidelines: '',
  });
  const [keywordsText, setKeywordsText] = useState('');
  const [forbiddenText, setForbiddenText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (brandKnowledge) {
      setFormData(brandKnowledge);
      setKeywordsText((brandKnowledge.keywords || []).join(', '));
      setForbiddenText((brandKnowledge.forbidden_keywords || []).join(', '));
    }
  }, [brandKnowledge]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const payload = {
      ...formData,
      keywords: keywordsText.split(',').map(k => k.trim()).filter(Boolean),
      forbidden_keywords: forbiddenText.split(',').map(k => k.trim()).filter(Boolean),
    };

    try {
      const res = await fetch('/api/marketing/brand-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedSuccess(true);
        if (data.brandKnowledge) onSaved(data.brandKnowledge);
        setTimeout(() => onClose(), 800);
      }
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-deep/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-sand-ivory dark:bg-[#0F1715] rounded-3xl shadow-2xl border border-sand-border dark:border-emerald-800/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-sand-border/80 flex items-center justify-between bg-sand-card dark:bg-[#15231F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-deep text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-deep dark:text-white">
                Brand Knowledge Base & Guidelines
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu">
                برانڈ کی شناخت، دینی اصول اور مارکیٹنگ اہداف کا تعین
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-charcoal-muted hover:text-charcoal-deep rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-deep dark:text-gray-200 mb-1">
                Brand Name (برانڈ کا نام)
              </label>
              <input
                type="text"
                value={formData.brand_name || ''}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-deep dark:text-gray-200 mb-1">
                Primary Marketing Goal (بنیادی ہدف)
              </label>
              <select
                value={formData.primary_goal || 'increase_engagement'}
                onChange={(e) => setFormData({ ...formData, primary_goal: e.target.value as MarketingGoal })}
                className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary"
              >
                <option value="increase_engagement">Maximize Engagement (اینگیجمنٹ و مکالمہ)</option>
                <option value="grow_followers">Grow Authentic Followers (فالورز میں اضافہ)</option>
                <option value="increase_reach">Expand Organic Reach (آرگینک ریچ کی وسعت)</option>
                <option value="promote_courses">Promote Courses / Services (کورسز کا فروغ)</option>
                <option value="generate_leads">Generate Leads (حصولِ روابط)</option>
                <option value="website_traffic">Drive Website Traffic (ویب سائٹ ٹریفک)</option>
                <option value="video_views">Increase Video Views (ویڈیو ویوز)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-deep dark:text-gray-200 mb-1">
              Description & Mission (مشن و تفصیل)
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary font-urdu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-deep dark:text-gray-200 mb-1">
              Target Audience (ہدف سامعین)
            </label>
            <input
              type="text"
              value={formData.target_audience || ''}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="e.g. Muslim families, youth, students of knowledge"
              className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-deep dark:text-gray-200 mb-1">
                Preferred Keywords (اہم مطلوبہ الفاظ)
              </label>
              <input
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="Comma separated: تفسیر, احادیث, تربیت"
                className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary font-urdu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                Forbidden / Avoid Keywords (ممنوعہ الفاظ)
              </label>
              <input
                type="text"
                value={forbiddenText}
                onChange={(e) => setForbiddenText(e.target.value)}
                placeholder="Comma separated: غیر مستند احادیث, مناظرہ"
                className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary font-urdu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-deep dark:text-gray-200 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-deep" />
              Islamic & Content Guidelines (دینی و اخلاقی ہدایات)
            </label>
            <textarea
              rows={2}
              value={formData.islamic_guidelines || ''}
              onChange={(e) => setFormData({ ...formData, islamic_guidelines: e.target.value })}
              placeholder="صرف مستند قرآنی و مسنون حوالہ جات استعمال کریں۔ متنازعہ مسائل سے گریز کریں۔"
              className="w-full px-3.5 py-2 rounded-xl bg-sand-card dark:bg-[#15231F] border border-sand-border dark:border-emerald-800/40 text-xs text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary font-urdu"
            />
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-sand-border/60 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Brand Knowledge saved successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Knowledge Base'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

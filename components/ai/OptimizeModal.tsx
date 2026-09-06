'use client';

import React, { useState } from 'react';
import { SocialPlatform, PlatformContentData } from '@/lib/types/database';
import { PLATFORM_INFO } from './PlatformTabs';
import { SocialIcon } from './SocialIcons';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { PLATFORM_OPTIMIZATION_RULES } from '@/lib/ai/optimization-rules';
import {
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface OptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: SocialPlatform;
  currentContent: PlatformContentData;
  onOptimize: (instruction: string) => Promise<void>;
}

const QUICK_INSTRUCTIONS: { label: string; urdu: string; instruction: string }[] = [
  {
    label: '🎓 Educational & Structured',
    urdu: 'تعلیمی اور منظم',
    instruction: 'Make the content more educational, insightful, and structured with clear actionable takeaways.',
  },
  {
    label: '💡 Punchier Scroll-Stopping Hook',
    urdu: 'طاقتور اور پرکشش ہک',
    instruction: 'Strengthen the opening hook to stop the scroll, spark curiosity with high adab, and eliminate generic openings.',
  },
  {
    label: '🔍 Boost SEO Keywords',
    urdu: 'بہتر SEO اور کی ورڈز',
    instruction: 'Enhance organic search discoverability by weaving in primary and long-tail Islamic keywords naturally.',
  },
  {
    label: '⚡ Shorten & Make Concise',
    urdu: 'مختصر اور جامع',
    instruction: 'Condense the text into concise, punchy bullet points without losing core spiritual meaning.',
  },
  {
    label: '👨‍👩‍👧 Target Parents & Families',
    urdu: 'خاندان اور والدین کی تربیت',
    instruction: 'Frame the reflection toward family tarbiyah, youth guidance, and mindful parenting.',
  },
  {
    label: '🌿 Spiritual & Heartfelt',
    urdu: 'روحانی اور دل نشین',
    instruction: 'Deepen the spiritual resonance, reverent tone, and heartfelt Islamic reflections.',
  },
];

export function OptimizeModal({
  isOpen,
  onClose,
  platform,
  currentContent,
  onOptimize,
}: OptimizeModalProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const info = PLATFORM_INFO[platform];
  const rule = PLATFORM_OPTIMIZATION_RULES[platform];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onOptimize(instruction);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickChip = (text: string) => {
    setInstruction((prev) => (prev ? `${prev}; ${text}` : text));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-deep/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-sand-ivory rounded-2xl border border-sand-border shadow-elevated p-6 overflow-hidden">
        {/* Top Gold Trim Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-primary via-gold-primary to-emerald-dark" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sand-border/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold-subtle rounded-xl border border-gold-border/60">
              <SocialIcon platform={platform} className={`w-5 h-5 ${info.color}`} />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-emerald-deep flex items-center gap-1.5">
                <span>AI Optimize for {info.name}</span>
                <span className="text-xs text-charcoal-muted font-normal font-sans">({info.urduName})</span>
              </h3>
              <p className="text-xs text-charcoal-muted">
                Phase 3 Platform Optimization Engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-charcoal-muted hover:text-emerald-deep rounded-lg hover:bg-sand-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Platform Strategy Highlights */}
          <div className="p-3 bg-emerald-subtle/50 rounded-xl border border-emerald-border/30 text-xs text-emerald-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
              <Zap className="w-3.5 h-3.5 text-gold-primary" />
              <span>{info.name} Optimization Targets:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-emerald-800/90 space-y-0.5 pl-1">
              {rule.guidelines.en.slice(0, 2).map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Quick Instruction Chips */}
          <div>
            <label className="block text-xs font-semibold text-emerald-deep mb-2">
              Quick Optimization Directives (فوری تجاویز):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INSTRUCTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectQuickChip(chip.instruction)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-sand-cream hover:bg-gold-subtle border border-sand-border hover:border-gold-primary/60 text-charcoal-main transition-all flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Box */}
          <Textarea
            label="Specific AI Revision Instructions (اختیاری ہدایات)"
            rows={3}
            placeholder="e.g. Make it more emotional, focus on Friday prayers, mention the website link clearly..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            helperText="AI will optimize solely this platform's copy while preserving your custom manual edits."
          />

          {/* Modal Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              leftIcon={<Sparkles className="w-4 h-4 text-gold-light" />}
            >
              {loading ? 'Optimizing with AI...' : 'Optimize Now (AI سے بہتر بنائیں)'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

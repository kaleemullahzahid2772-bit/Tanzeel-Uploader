'use client';

import React, { useState } from 'react';
import {
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  PlatformContentData,
} from '@/lib/types/database';
import { PLATFORM_INFO } from './PlatformTabs';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { RefreshCw, Wand2 } from 'lucide-react';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: SocialPlatform;
  currentContent: PlatformContentData;
  onRegenerate: (instruction: string, tone?: ContentTone, language?: ContentLanguage) => Promise<void>;
}

const PRESET_INSTRUCTIONS = [
  { label: '✨ Make it more poetic & literary (ادبی و فصیح)', value: 'Rewrite in a more poetic, literary, and heartfelt tone.' },
  { label: '⚡ Make it shorter & punchier (مختصر اور جامع)', value: 'Make the content much more concise, impactful, and punchy.' },
  { label: '🌿 Add authentic Islamic context & citations', value: 'Include deeper spiritual reflection, authentic Islamic values, and mindful contemplation.' },
  { label: '🏷️ Optimize hashtags & SEO discovery', value: 'Enhance the hashtags and keywords for maximum viral discovery and relevance.' },
  { label: '💬 Stronger Call To Action (قوی تر دعوتِ عمل)', value: 'Create a much more engaging and compelling Call to Action for community discussion.' },
  { label: '🌐 Translate / Adapt to Urdu (اردو میں ڈھالیں)', value: 'Ensure full high-standard Urdu adaptation with dignified vocabulary.' },
  { label: '🌐 Adapt to English (انگریزی میں ترجمہ)', value: 'Translate and adapt this content into polished, eloquent English.' },
];

export function RegenerateModal({
  isOpen,
  onClose,
  platform,
  currentContent: _currentContent,
  onRegenerate,
}: RegenerateModalProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const info = PLATFORM_INFO[platform];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) {
      setError('Please provide or select an instruction for the AI revision.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRegenerate(instruction.trim());
      onClose();
    } catch (err: unknown) {
      console.error('Single platform regenerate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate content');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setInstruction((prev) => (prev ? `${prev}\n${presetText}` : presetText));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Revise — ${info.name}`}
      description={`Instruct the Islamic AI Brain to regenerate or refine the content specifically for ${info.urduName}.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {/* Preset Quick Prompts */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-emerald-deep flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-gold-primary" />
            <span>Quick Revision Presets (Click to add):</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_INSTRUCTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.value)}
                className="text-[11px] px-2.5 py-1 bg-sand-cream hover:bg-gold-subtle text-charcoal-main hover:text-emerald-deep border border-sand-border hover:border-gold-border rounded-lg transition-all text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions Textarea */}
        <Textarea
          label="AI Revision Instructions"
          rows={4}
          required
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Focus more on youth education, make the hook question-based, shorten the caption by 30%..."
          helperText="Provide specific feedback or guidance for the AI"
        />

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-gold-light" />}
          >
            Regenerate {info.name} Copy
          </Button>
        </div>
      </form>
    </Modal>
  );
}

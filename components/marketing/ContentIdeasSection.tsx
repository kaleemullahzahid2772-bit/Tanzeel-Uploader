'use client';

import React from 'react';
import { AIContentIdea } from '@/lib/types/database';
import { Sparkles, PlusSquare, ArrowRight, Bookmark, Check } from 'lucide-react';
import Link from 'next/link';

interface ContentIdeasSectionProps {
  ideas: AIContentIdea[];
  onGenerateIdeas: () => void;
  generating: boolean;
}

export function ContentIdeasSection({ ideas, onGenerateIdeas, generating }: ContentIdeasSectionProps) {
  return (
    <div className="bg-sand-ivory dark:bg-[#111C18] rounded-3xl p-6 sm:p-8 border border-sand-border dark:border-emerald-800/30 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-border/60 pb-5">
        <div>
          <h3 className="text-lg font-bold font-heading text-emerald-deep dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-deep" />
            High-Resonance AI Content Ideas
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu mt-0.5">
            برانڈ نالج اور مقبول ترین موضوعات کی بنیاد پر خودکار نئے کنٹینٹ آئیڈیاز
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerateIdeas}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating Ideas...' : 'Generate Fresh Ideas'}</span>
        </button>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="p-5 rounded-2xl bg-sand-card dark:bg-[#15231F] border border-sand-border/80 dark:border-emerald-800/20 hover:border-gold-border/70 transition-all flex flex-col justify-between gap-4 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-subtle text-gold-deep font-bold border border-gold-border">
                  {idea.target_platform} • {idea.content_type}
                </span>
                <span className="text-[11px] font-mono text-emerald-primary font-bold">
                  ★ {idea.estimated_resonance_score}/10
                </span>
              </div>

              <h4 className="text-sm font-bold text-emerald-deep dark:text-white mb-1.5">
                {idea.title}
              </h4>

              {idea.hook && (
                <div className="p-2.5 rounded-xl bg-sand-muted/60 dark:bg-emerald-950/30 text-xs text-charcoal-deep dark:text-gray-300 font-urdu mb-2">
                  <span className="font-bold text-gold-deep block text-[10px]">Opening Hook:</span>
                  "{idea.hook}"
                </div>
              )}

              <p className="text-xs text-charcoal-muted dark:text-gray-400 font-urdu line-clamp-2">
                {idea.reason || idea.objective}
              </p>
            </div>

            <div className="pt-3 border-t border-sand-border/50 flex items-center justify-between gap-2">
              <span className="text-[11px] text-charcoal-light dark:text-gray-400 truncate">
                CTA: {idea.cta ? idea.cta.slice(0, 24) + '...' : 'Save & Share'}
              </span>

              <Link
                href={`/dashboard/create-post?topic=${encodeURIComponent(idea.topic || idea.title)}&platform=${encodeURIComponent(idea.target_platform === 'all' ? 'instagram' : idea.target_platform)}&format=${encodeURIComponent(idea.content_type)}&notes=${encodeURIComponent(`AI Idea: ${idea.title}. Hook: ${idea.hook || ''}. Suggested CTA: ${idea.cta || ''}`)}`}
                className="px-3 py-1.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <span>Create Post</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

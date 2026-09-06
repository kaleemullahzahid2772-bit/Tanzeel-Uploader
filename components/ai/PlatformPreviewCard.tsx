'use client';

import React, { useState } from 'react';
import {
  SocialPlatform,
  PlatformContentData,
  QualityCheckResult,
  MediaItem,
  ContentVersion,
} from '@/lib/types/database';
import { PLATFORM_INFO } from './PlatformTabs';
import { SocialIcon } from './SocialIcons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PLATFORM_OPTIMIZATION_RULES } from '@/lib/ai/optimization-rules';
import {
  Copy,
  Check,
  Edit3,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Share2,
  Heart,
  MessageSquare,
  Bookmark,
  Repeat,
  Send,
  Eye,
  Hash,
  Film,
  History,
  Tag,
  Accessibility,
  Video,
  ListOrdered,
  Lightbulb,
} from 'lucide-react';
import Image from 'next/image';

interface PlatformPreviewCardProps {
  platform: SocialPlatform;
  content: PlatformContentData;
  validation?: QualityCheckResult;
  media?: MediaItem | null;
  onEdit: () => void;
  onOptimize: () => void;
  onOpenVersions: () => void;
  onToggleApprove: () => void;
}

export function PlatformPreviewCard({
  platform,
  content,
  validation,
  media,
  onEdit,
  onOptimize,
  onOpenVersions,
  onToggleApprove,
}: PlatformPreviewCardProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const info = PLATFORM_INFO[platform];
  const rule = PLATFORM_OPTIMIZATION_RULES[platform];

  const isApproved = content.optimization_status === 'approved';

  // Determine text direction
  const sampleText = `${content.title || ''} ${content.hook || ''} ${content.caption || ''}`;
  const isRTL = /[\u0600-\u06FF]/.test(sampleText);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = () => {
    const parts: string[] = [];
    if (content.title) parts.push(`📌 ${content.title}`);
    if (content.hook) parts.push(`💡 ${content.hook}`);
    if (content.caption) parts.push(content.caption);
    if (content.description) parts.push(content.description);
    if (content.hashtags && content.hashtags.length > 0) parts.push(content.hashtags.join(' '));
    if (content.keywords && content.keywords.length > 0) parts.push(`Keywords: ${content.keywords.join(', ')}`);
    if (content.tags && content.tags.length > 0) parts.push(`Tags: ${content.tags.join(', ')}`);
    if (content.cta) parts.push(`👉 ${content.cta}`);
    if (content.alt_text) parts.push(`Alt-Text: ${content.alt_text}`);

    copyToClipboard(parts.join('\n\n'), 'all');
  };

  const totalLength = (content.caption || '').length + (content.title || '').length;
  const score = content.quality_score || validation?.score || 95;
  const breakdown = content.score_breakdown || validation?.breakdown;
  const suggestions = content.optimization_suggestions || validation?.suggestions || [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-sand-ivory rounded-2xl border border-sand-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sand-cream rounded-xl border border-sand-border shadow-2xs">
            <SocialIcon platform={platform} className={`w-6 h-6 ${info.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-deep flex items-center gap-2">
              {info.name} Studio Preview
              <span className="text-xs text-charcoal-muted font-normal font-sans">
                ({info.urduName})
              </span>
            </h3>
            <p className="text-[11px] text-charcoal-muted">
              {isRTL ? 'اردو / عربی (RTL)' : 'English (LTR)'} • Optimal limit: {rule.recommendedCaptionLength || rule.maxCaptionLength} chars
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quality Score Trigger */}
          <button
            type="button"
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              score >= 90
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : score >= 75
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
            }`}
            title="Click to toggle quality score breakdown"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Score: {score}/100</span>
          </button>

          {/* Version History Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenVersions}
            leftIcon={<History className="w-3.5 h-3.5 text-charcoal-muted" />}
          >
            History
          </Button>

          {/* Inline Edit Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          {/* AI Optimize Button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOptimize}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-gold-primary" />}
          >
            AI Optimize
          </Button>

          {/* Approval Toggle Button */}
          <Button
            type="button"
            variant={isApproved ? 'outline' : 'primary'}
            size="sm"
            onClick={onToggleApprove}
            className={isApproved ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : ''}
            leftIcon={isApproved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-gold-light" />}
          >
            {isApproved ? 'Approved ✓' : 'Approve for Publishing'}
          </Button>
        </div>
      </div>

      {/* Quality Score Breakdown Accordion */}
      {showScoreBreakdown && breakdown && (
        <div className="p-4 bg-sand-cream/80 border border-gold-primary/30 rounded-2xl animate-fadeIn space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-deep">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-primary" />
              <span>Algorithmic Quality Score Breakdown (0–100):</span>
            </span>
            <span className="font-mono text-emerald-primary">{score}/100</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border text-center">
              <div className="text-charcoal-muted">Hook Strength</div>
              <div className="font-mono font-bold text-emerald-deep mt-0.5">{breakdown.hookScore}/20</div>
            </div>
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border text-center">
              <div className="text-charcoal-muted">Platform Fit</div>
              <div className="font-mono font-bold text-emerald-deep mt-0.5">{breakdown.platformFitScore}/20</div>
            </div>
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border text-center">
              <div className="text-charcoal-muted">SEO Keywords</div>
              <div className="font-mono font-bold text-emerald-deep mt-0.5">{breakdown.seoScore}/20</div>
            </div>
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border text-center">
              <div className="text-charcoal-muted">CTA Quality</div>
              <div className="font-mono font-bold text-emerald-deep mt-0.5">{breakdown.ctaScore}/15</div>
            </div>
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border text-center">
              <div className="text-charcoal-muted">Hashtags</div>
              <div className="font-mono font-bold text-emerald-deep mt-0.5">{breakdown.hashtagScore}/15</div>
            </div>
            <div className="p-2 bg-sand-ivory rounded-xl border border-sand-border text-center">
              <div className="text-charcoal-muted">Islamic Adab</div>
              <div className="font-mono font-bold text-emerald-deep mt-0.5">{breakdown.islamicAdabScore}/10</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Optimization Suggestions Alert (if any) */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-gold-subtle/40 border border-gold-border/60 rounded-2xl space-y-2 text-xs text-charcoal-main animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold text-emerald-deep">
            <Lightbulb className="w-4 h-4 text-gold-deep" />
            <span>Optimization Suggestions (بہتری کے لیے AI تجاویز):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-charcoal-muted pl-1">
            {suggestions.map((sug, idx) => (
              <li key={idx} className="leading-relaxed">
                {sug}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Islamic Safety Notes */}
      {validation && validation.islamicSafetyNotes.length > 0 && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {validation.islamicSafetyNotes.map((note, idx) => (
              <p key={idx} className="font-medium leading-relaxed">{note}</p>
            ))}
          </div>
        </div>
      )}

      {/* Visual Platform Mockup Container */}
      <div className="bg-sand-muted/50 rounded-2xl border border-sand-border/80 p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-xl bg-sand-ivory rounded-2xl border border-sand-border shadow-card overflow-hidden">
          {/* Mockup Header */}
          <div className="px-4 py-3 border-b border-sand-border/60 flex items-center justify-between bg-sand-cream/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-deep flex items-center justify-center text-gold-light text-xs font-serif font-bold">
                نور
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-deep flex items-center gap-1">
                  <span>Nūr Social Marketing</span>
                  <Sparkles className="w-3 h-3 text-gold-primary" />
                </div>
                <div className="text-[10px] text-charcoal-muted">Just now • 🌍 Public</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isApproved && (
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-semibold">
                  Approved ✓
                </span>
              )}
              <span className="text-[10px] font-mono uppercase text-charcoal-muted bg-sand-muted px-2 py-0.5 rounded border border-sand-border">
                {platform.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Mockup Content Area */}
          <div className="p-4 sm:p-5 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Title (YouTube / Facebook / WhatsApp) */}
            {content.title && (
              <div className="font-serif font-bold text-base sm:text-lg text-emerald-deep leading-snug">
                {content.title}
              </div>
            )}

            {/* Hook (Instagram / TikTok) */}
            {content.hook && (
              <div className="p-2.5 bg-gold-subtle/40 border-l-2 border-gold-primary rounded-r-lg text-xs sm:text-sm font-semibold text-emerald-deep">
                {content.hook}
              </div>
            )}

            {/* Main Caption / Body */}
            {content.caption && (
              <div className="text-xs sm:text-sm text-charcoal-main whitespace-pre-line leading-relaxed">
                {content.caption}
              </div>
            )}

            {/* Video Description (YouTube) */}
            {content.description && (
              <div className="p-3 bg-sand-cream/70 rounded-xl border border-sand-border/80 text-xs text-charcoal-muted whitespace-pre-line leading-relaxed font-sans">
                {content.description}
              </div>
            )}

            {/* Attached Media Mockup View */}
            {media && (
              <div className="relative aspect-video w-full bg-charcoal-main rounded-xl overflow-hidden border border-sand-border my-3 flex items-center justify-center">
                {media.file_type === 'video' ? (
                  <div className="flex flex-col items-center justify-center text-sand-ivory">
                    <Film className="w-8 h-8 text-gold-primary mb-1" />
                    <span className="text-xs font-mono uppercase tracking-wide">Video Attached</span>
                  </div>
                ) : (
                  <Image
                    src={media.public_url}
                    alt={media.file_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
            )}

            {/* Call To Action (CTA) Box */}
            {content.cta && (
              <div className="p-3 bg-emerald-subtle/50 rounded-xl border border-emerald-border/30 text-xs font-medium text-emerald-deep flex items-center gap-2">
                <span className="text-emerald-primary text-sm font-bold">👉</span>
                <span>{content.cta}</span>
              </div>
            )}

            {/* Platform Specialized Metadata Boxes */}
            {/* 1. Instagram Alt-Text */}
            {content.alt_text && (
              <div className="p-2.5 bg-sand-cream/60 rounded-xl border border-sand-border/70 text-xs text-charcoal-muted space-y-1" dir="ltr">
                <div className="flex items-center justify-between font-semibold text-[11px] text-emerald-deep">
                  <span className="flex items-center gap-1">
                    <Accessibility className="w-3.5 h-3.5 text-emerald-primary" />
                    <span>Image Alt Text (Accessibility):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(content.alt_text || '', 'alt')}
                    className="text-[10px] text-emerald-700 hover:underline"
                  >
                    {copiedSection === 'alt' ? 'Copied!' : 'Copy Alt'}
                  </button>
                </div>
                <p className="text-[11px] italic">"{content.alt_text}"</p>
              </div>
            )}

            {/* 2. TikTok Suggested On-Screen & Spoken Hook */}
            {(content.suggested_on_screen_text || content.suggested_opening_line) && (
              <div className="p-3 bg-emerald-subtle/30 rounded-xl border border-emerald-border/30 text-xs text-emerald-900 space-y-2" dir="ltr">
                <div className="font-semibold text-[11px] text-emerald-800 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-gold-primary" />
                  <span>TikTok Video Direction & Hooks:</span>
                </div>
                {content.suggested_on_screen_text && (
                  <div className="text-[11px]">
                    <span className="font-medium text-emerald-800">On-Screen Overlay:</span>{' '}
                    <span className="font-sans italic">{content.suggested_on_screen_text}</span>
                  </div>
                )}
                {content.suggested_opening_line && (
                  <div className="text-[11px]">
                    <span className="font-medium text-emerald-800">Spoken Hook (3s):</span>{' '}
                    <span className="font-sans italic">"{content.suggested_opening_line}"</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. YouTube Chapters */}
            {content.chapters && content.chapters.length > 0 && (
              <div className="p-3 bg-sand-cream/70 rounded-xl border border-sand-border text-xs text-charcoal-muted space-y-1.5" dir="ltr">
                <div className="flex items-center justify-between font-semibold text-[11px] text-emerald-deep">
                  <span className="flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-primary" />
                    <span>Video Chapters & Timestamps:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        content.chapters?.map((c) => `${c.timestamp} - ${c.title}`).join('\n') || '',
                        'chapters'
                      )
                    }
                    className="text-[10px] text-emerald-700 hover:underline"
                  >
                    {copiedSection === 'chapters' ? 'Copied!' : 'Copy Chapters'}
                  </button>
                </div>
                <div className="space-y-0.5 text-[11px] font-mono">
                  {content.chapters.map((ch, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-gold-deep font-semibold">{ch.timestamp}</span>
                      <span className="text-charcoal-main font-sans">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {content.hashtags && content.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-sand-border/50" dir="ltr">
                {content.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-primary bg-emerald-subtle/60 border border-emerald-border/20"
                  >
                    <Hash className="w-2.5 h-2.5" />
                    {tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}

            {/* Keywords / Tags (TikTok / YouTube) */}
            {((content.keywords && content.keywords.length > 0) || (content.tags && content.tags.length > 0)) && (
              <div className="space-y-1.5 pt-2 text-[11px] text-charcoal-muted border-t border-sand-border/40" dir="ltr">
                <span className="font-semibold text-charcoal-main">SEO Keywords & Search Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {(content.keywords || content.tags || []).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-sand-muted text-charcoal-main border border-sand-border text-[10px]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mockup Interaction Footer Bar */}
          <div className="px-4 py-2.5 bg-sand-cream/30 border-t border-sand-border/60 flex items-center justify-between text-charcoal-muted text-xs">
            {platform === 'twitter' && (
              <div className="flex items-center justify-around w-full">
                <span className="flex items-center gap-1 hover:text-sky-600 cursor-pointer"><MessageSquare className="w-3.5 h-3.5" /> 12</span>
                <span className="flex items-center gap-1 hover:text-emerald-600 cursor-pointer"><Repeat className="w-3.5 h-3.5" /> 34</span>
                <span className="flex items-center gap-1 hover:text-rose-600 cursor-pointer"><Heart className="w-3.5 h-3.5" /> 89</span>
                <span className="flex items-center gap-1 hover:text-sky-600 cursor-pointer"><Share2 className="w-3.5 h-3.5" /></span>
              </div>
            )}

            {platform === 'instagram' && (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-500 cursor-pointer" />
                  <MessageSquare className="w-4 h-4 cursor-pointer" />
                  <Send className="w-4 h-4 cursor-pointer" />
                </div>
                <Bookmark className="w-4 h-4 cursor-pointer" />
              </div>
            )}

            {platform === 'facebook' && (
              <div className="flex items-center justify-around w-full">
                <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><Heart className="w-3.5 h-3.5 text-blue-600" /> Like</span>
                <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><MessageSquare className="w-3.5 h-3.5" /> Comment</span>
                <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Share</span>
              </div>
            )}

            {platform === 'youtube' && (
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Ready for upload</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-semibold">
                  Subscribe
                </button>
              </div>
            )}

            {platform === 'tiktok' && (
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px]">🎵 Original Islamic Audio • Sound</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-primary">TikTok Optimized</span>
              </div>
            )}

            {platform === 'whatsapp' && (
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] text-emerald-700 font-medium">WhatsApp Broadcast Ready</span>
                <span className="text-[10px] font-mono text-charcoal-light">12:30 PM ✓✓</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Granular Copy Bar & Metadata Footer */}
      <div className="p-4 bg-sand-ivory rounded-2xl border border-sand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-muted">
        <div className="flex items-center gap-3">
          <span className="font-mono">
            Chars: <strong className="text-emerald-deep">{totalLength}</strong>
            {platform === 'twitter' && (
              <span className={totalLength > 280 ? ' text-rose-600 font-bold' : ' text-emerald-600'}>
                {' '}/ 280
              </span>
            )}
          </span>
          <span>•</span>
          <span>
            Hashtags: <strong className="text-emerald-deep">{content.hashtags?.length || 0}</strong>
          </span>
          <span>•</span>
          <span>
            Status: <strong className="text-emerald-primary uppercase font-mono">{content.optimization_status || 'optimized'}</strong>
          </span>
        </div>

        {/* Granular Copy Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            leftIcon={copiedSection === 'all' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          >
            {copiedSection === 'all' ? 'Copied Full!' : 'Copy Full Post'}
          </Button>

          {content.caption && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(content.caption || '', 'caption')}
            >
              {copiedSection === 'caption' ? 'Copied!' : 'Copy Caption'}
            </Button>
          )}

          {content.hashtags && content.hashtags.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(content.hashtags?.join(' ') || '', 'tags')}
            >
              {copiedSection === 'tags' ? 'Copied!' : 'Copy Hashtags'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

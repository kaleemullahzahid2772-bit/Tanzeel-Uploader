'use client';

import React from 'react';
import {
  SocialPlatform,
  PlatformContentData,
  OptimizationStatus,
} from '@/lib/types/database';
import { PLATFORM_INFO } from './PlatformTabs';
import { SocialIcon } from './SocialIcons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PLATFORM_OPTIMIZATION_RULES } from '@/lib/ai/optimization-rules';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders,
  Check,
  RotateCcw,
} from 'lucide-react';

interface PlatformComparisonTableProps {
  contents: Record<SocialPlatform, PlatformContentData>;
  availablePlatforms: SocialPlatform[];
  onSelectPlatform: (platform: SocialPlatform) => void;
  onOptimizePlatform: (platform: SocialPlatform) => void;
  onApprovePlatform: (platform: SocialPlatform) => void;
}

export function PlatformComparisonTable({
  contents,
  availablePlatforms,
  onSelectPlatform,
  onOptimizePlatform,
  onApprovePlatform,
}: PlatformComparisonTableProps) {
  return (
    <div className="bg-sand-ivory rounded-2xl border border-sand-border shadow-card overflow-hidden">
      <div className="p-5 border-b border-sand-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sand-cream/40">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-emerald-deep">
              Platform Optimization Matrix
            </h3>
            <Badge variant="gold" size="sm">
              فیز 3 • تقابلی جائزہ
            </Badge>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Compare quality scores, length constraints, and optimization readiness across all channels.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-charcoal-main">
          <thead className="bg-sand-cream/60 border-b border-sand-border/70 text-[11px] font-mono uppercase text-charcoal-muted">
            <tr>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4 text-center">Quality Score</th>
              <th className="py-3 px-4">Length / Limits</th>
              <th className="py-3 px-4 text-center">SEO & Tags</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-border/60">
            {availablePlatforms.map((platform) => {
              const info = PLATFORM_INFO[platform];
              const rule = PLATFORM_OPTIMIZATION_RULES[platform];
              const content = contents[platform];

              if (!content) return null;

              const totalChars = (content.caption || '').length + (content.title || '').length;
              const quality = content.quality_score || 90;
              const status: OptimizationStatus = content.optimization_status || 'draft';
              const isApproved = status === 'approved';

              return (
                <tr
                  key={platform}
                  className="hover:bg-sand-muted/40 transition-colors group"
                >
                  {/* Platform */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-sand-ivory border border-sand-border/80 shadow-2xs">
                        <SocialIcon platform={platform} className={`w-4 h-4 ${info.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-emerald-deep text-xs">
                          {info.name}
                        </div>
                        <div className="text-[10px] text-charcoal-muted font-sans">
                          {info.urduName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Quality Score */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sand-ivory border border-sand-border">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          quality >= 90
                            ? 'bg-emerald-500'
                            : quality >= 75
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span
                        className={
                          quality >= 90
                            ? 'text-emerald-800'
                            : quality >= 75
                            ? 'text-amber-800'
                            : 'text-rose-800'
                        }
                      >
                        {quality}/100
                      </span>
                    </div>
                  </td>

                  {/* Length / Limits */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs">
                      <span className="font-mono font-medium text-emerald-deep">
                        {totalChars} chars
                      </span>
                      {platform === 'twitter' && (
                        <span
                          className={`text-[10px] ml-1 font-mono ${
                            totalChars > 280 ? 'text-rose-600 font-bold' : 'text-emerald-700'
                          }`}
                        >
                          / 280
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-charcoal-muted">
                      Hashtags: {content.hashtags?.length || 0} (rec: {rule.minHashtags}-{rule.maxHashtags})
                    </div>
                  </td>

                  {/* SEO & Keywords */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono text-xs font-semibold text-emerald-deep">
                        {(content.keywords?.length || 0) + (content.tags?.length || 0)} Tags
                      </span>
                      <span className="text-[10px] text-charcoal-muted">
                        {content.seo_keywords?.primary?.length || 0} Primary
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wide ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : status === 'optimized'
                          ? 'bg-gold-subtle text-gold-deep border border-gold-border'
                          : status === 'needs_review'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-sand-muted text-charcoal-muted border border-sand-border'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          Approved
                        </>
                      ) : status === 'optimized' ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-gold-primary" />
                          Optimized
                        </>
                      ) : (
                        status
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectPlatform(platform)}
                        leftIcon={<Eye className="w-3 h-3" />}
                        title="View Preview Card"
                      >
                        Preview
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onOptimizePlatform(platform)}
                        leftIcon={<Sparkles className="w-3 h-3 text-gold-primary" />}
                        title="Optimize with AI"
                      >
                        AI Optimize
                      </Button>

                      <Button
                        type="button"
                        variant={isApproved ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => onApprovePlatform(platform)}
                        className={isApproved ? 'text-emerald-700 bg-emerald-50/60 text-xs' : 'text-xs'}
                      >
                        {isApproved ? 'Approved ✓' : 'Approve'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

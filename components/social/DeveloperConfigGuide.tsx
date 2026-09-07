'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SocialPlatform } from '@/lib/types/database';
import { getOAuthProviderConfig } from '@/lib/oauth/config';
import { ExternalLink, Code2 } from 'lucide-react';

interface DeveloperConfigGuideProps {
  platform: SocialPlatform | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedConnect?: (platform: SocialPlatform) => void;
}

export function DeveloperConfigGuide({
  platform,
  isOpen,
  onClose,
  onProceedConnect,
}: DeveloperConfigGuideProps) {
  if (!platform) return null;
  const config = getOAuthProviderConfig(platform);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'Setup & Login Guide — ' + config.name}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs sm:text-sm">
        {/* Intro */}
        <div className="p-3.5 rounded-xl bg-sand-light border border-sand-border space-y-1.5">
          <p className="font-bold text-emerald-deep font-serif text-sm">
            Official {config.name} OAuth Authentication
          </p>
          <p className="text-charcoal-muted text-xs leading-relaxed">
            Clicking Authorize redirects directly to the official {config.name} login page. If you are configuring your own custom Meta Developer App, use the credentials and callback URLs below:
          </p>
        </div>

        {/* Environment Variables Code Block */}
        <div className="p-3 rounded-xl bg-emerald-deep text-sand-light font-mono text-xs space-y-1.5 overflow-x-auto">
          <div className="flex items-center gap-2 text-gold-primary text-[11px] pb-1 border-b border-emerald-primary/30 font-medium">
            <Code2 className="w-3.5 h-3.5" />
            <span>.env.local / Vercel Environment Configuration:</span>
          </div>
          <p className="text-emerald-300"># {config.name} OAuth Keys</p>
          <p className="break-all">{config.clientIdEnv}=your_{platform}_client_id</p>
          <p className="break-all">{config.clientSecretEnv}=your_{platform}_client_secret</p>
        </div>

        {/* Valid OAuth Redirect URIs */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-emerald-deep text-xs uppercase tracking-wider">
            Valid OAuth Redirect URIs for Meta Developer Portal:
          </h4>
          
          <div className="space-y-1">
            <span className="text-[10px] text-charcoal-light font-mono font-medium uppercase">
              1. Production Vercel Domain:
            </span>
            <div className="p-2.5 rounded-lg bg-sand-light border border-sand-border font-mono text-[11px] sm:text-xs select-all text-emerald-deep break-all">
              https://tanzeel-uploader.vercel.app/api/oauth/{platform}/callback
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-charcoal-light font-mono font-medium uppercase">
              2. Local Development:
            </span>
            <div className="p-2.5 rounded-lg bg-sand-light border border-sand-border font-mono text-[11px] sm:text-xs select-all text-emerald-deep break-all">
              http://localhost:4000/api/oauth/{platform}/callback
            </div>
          </div>
        </div>

        {/* Official Docs Link */}
        <div className="p-3 rounded-xl bg-sand-subtle border border-sand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-charcoal-muted">Developer Documentation:</span>
          <a
            href={config.setupGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-primary hover:text-emerald-deep font-semibold"
          >
            <span>Open {config.name} Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-sand-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>

          {onProceedConnect && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onProceedConnect(platform);
              }}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Continue to {config.name.split(' ')[0]} Login
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

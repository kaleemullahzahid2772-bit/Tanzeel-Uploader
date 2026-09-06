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
}

export function DeveloperConfigGuide({
  platform,
  isOpen,
  onClose,
}: DeveloperConfigGuideProps) {
  if (!platform) return null;
  const config = getOAuthProviderConfig(platform);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'Developer Credentials Setup — ' + config.name}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs">
        <div className="p-3.5 rounded-xl bg-sand-light border border-sand-border space-y-1">
          <p className="font-bold text-emerald-deep font-serif">
            Environment Variables Required:
          </p>
          <p className="text-charcoal-muted">
            To enable live OAuth authentication for {config.name}, add the following credentials to your <code className="bg-sand-border/50 px-1 py-0.5 rounded font-mono">.env.local</code> file:
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-deep text-sand-light font-mono space-y-1.5 overflow-x-auto">
          <div className="flex items-center gap-2 text-gold-primary text-[11px] pb-1 border-b border-emerald-primary/30">
            <Code2 className="w-3.5 h-3.5" />
            <span>.env.local configuration:</span>
          </div>
          <p className="text-emerald-300"># {config.name} OAuth Credentials</p>
          <p>{config.clientIdEnv}=your_{platform}_client_id</p>
          <p>{config.clientSecretEnv}=your_{platform}_client_secret</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-emerald-deep">Callback URL to configure in Developer Portal:</h4>
          <div className="p-2.5 rounded-lg bg-sand-light border border-sand-border font-mono text-[11px] select-all">
            http://localhost:4000/api/oauth/{platform}/callback
          </div>
        </div>

        <div className="p-3 rounded-xl bg-sand-subtle border border-sand-border flex items-center justify-between">
          <span className="text-charcoal-muted">Official Developer Portal Documentation:</span>
          <a
            href={config.setupGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-primary hover:text-emerald-deep font-semibold"
          >
            <span>Open {config.name} Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex justify-end pt-3 border-t border-sand-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SocialPlatform } from '@/lib/types/database';
import { getOAuthProviderConfig } from '@/lib/oauth/config';
import { Shield, CheckCircle2, Lock, ExternalLink } from 'lucide-react';

interface PermissionsModalProps {
  platform: SocialPlatform | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedConnect: (platform: SocialPlatform) => void;
}

export function PermissionsModal({
  platform,
  isOpen,
  onClose,
  onProceedConnect,
}: PermissionsModalProps) {
  if (!platform) return null;
  const config = getOAuthProviderConfig(platform);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'OAuth Permissions — ' + config.name}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans">
        {/* Intro banner */}
        <div className="p-3.5 rounded-xl bg-emerald-subtle/50 border border-emerald-border/40 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-primary shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-deep leading-relaxed">
            <p className="font-bold font-serif mb-0.5">
              Strict Least-Privilege OAuth 2.0 Policy
            </p>
            <p className="text-charcoal-muted">
              Nūr Social only requests the exact permissions required to verify your account and prepare publishing in Phase 5. We never access private personal messages or ask for your password.
            </p>
          </div>
        </div>

        {/* Human-Readable Permissions List */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-emerald-deep uppercase tracking-wider">
            Requested Scopes & Explanation:
          </h4>

          {config.permissions.map((perm) => (
            <div
              key={perm.key}
              className="p-3 rounded-xl bg-sand-light/60 border border-sand-border/70 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-primary" />
                  <span className="text-xs font-bold text-emerald-deep">
                    {perm.label.en}
                  </span>
                </div>
                <span className="text-[10px] text-charcoal-light font-urdu">
                  {perm.label.ur}
                </span>
              </div>

              <p className="text-xs text-charcoal-muted pl-6">
                {perm.description.en}
              </p>
              <p className="text-[11px] text-emerald-deep/80 pl-6 font-urdu">
                {perm.description.ur}
              </p>
            </div>
          ))}
        </div>

        {/* Security Assurance */}
        <div className="p-3 rounded-xl bg-sand-subtle border border-sand-border text-[11px] text-charcoal-muted flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gold-primary shrink-0" />
          <span>
            Access tokens are encrypted using military-grade AES-256-GCM before storage.
          </span>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onProceedConnect(platform);
            }}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Authorize on {config.name.split(' ')[0]}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

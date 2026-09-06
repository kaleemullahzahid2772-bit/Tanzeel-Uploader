'use client';

import React from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SocialAccountPublic } from '@/lib/types/database';
import { getOAuthProviderConfig } from '@/lib/oauth/config';
import { SocialIcon } from '@/components/ai/SocialIcons';
import {
  Shield,
  Clock,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface ManageAccountModalProps {
  account: SocialAccountPublic | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestDisconnect: (account: SocialAccountPublic) => void;
  onRefreshAccount: (account: SocialAccountPublic) => void;
  isActionLoading?: boolean;
}

export function ManageAccountModal({
  account,
  isOpen,
  onClose,
  onRequestDisconnect,
  onRefreshAccount,
  isActionLoading = false,
}: ManageAccountModalProps) {
  if (!account) return null;

  const config = getOAuthProviderConfig(account.platform);
  const connectedDate = new Date(account.connected_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const expiryDate = account.token_expires_at
    ? new Date(account.token_expires_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No Expiration / Permanent Access';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'Manage ' + config.name + ' Account'}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Profile Card */}
        <div className="p-4 rounded-xl bg-sand-light/70 border border-sand-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {account.profile_image_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gold-primary/40 shadow-xs">
                <Image
                  src={account.profile_image_url}
                  alt={account.account_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-subtle text-emerald-primary font-bold text-base flex items-center justify-center shrink-0 border border-emerald-primary/20">
                {account.account_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-emerald-deep truncate">
                  {account.account_name}
                </h3>
                <Badge
                  variant={
                    account.status === 'connected'
                      ? 'ready'
                      : account.status === 'expiring_soon'
                      ? 'gold'
                      : 'failed'
                  }
                  size="sm"
                >
                  {account.status === 'connected' ? 'Connected ✓' : account.status}
                </Badge>
              </div>
              <p className="text-[11px] text-charcoal-muted font-mono truncate mt-0.5">
                {account.username || 'ID: ' + account.account_id}
              </p>
            </div>
          </div>

          <div className="w-9 h-9 rounded-lg bg-white border border-sand-border flex items-center justify-center shrink-0">
            <SocialIcon platform={account.platform} className="w-5 h-5 text-emerald-primary" />
          </div>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border border-sand-border/70 space-y-1">
            <span className="text-[10px] text-charcoal-light font-medium uppercase tracking-wider">
              Platform Account ID
            </span>
            <div className="font-mono text-xs text-emerald-deep font-semibold truncate select-all">
              {account.account_id}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-sand-border/70 space-y-1">
            <span className="text-[10px] text-charcoal-light font-medium uppercase tracking-wider">
              Token Security
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-primary font-medium">
              <Lock className="w-3.5 h-3.5 text-gold-primary" />
              <span>AES-256 Encrypted in Supabase</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-sand-border/70 space-y-1">
            <span className="text-[10px] text-charcoal-light font-medium uppercase tracking-wider">
              Connected On
            </span>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-dark">
              <Clock className="w-3.5 h-3.5 text-gold-primary" />
              <span>{connectedDate}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-sand-border/70 space-y-1">
            <span className="text-[10px] text-charcoal-light font-medium uppercase tracking-wider">
              Token Expiration
            </span>
            <div
              className={
                'flex items-center gap-1.5 text-xs font-medium ' +
                (account.is_expired
                  ? 'text-danger'
                  : account.is_expiring_soon
                  ? 'text-gold-deep'
                  : 'text-charcoal-dark')
              }
            >
              {account.is_expired ? (
                <AlertTriangle className="w-3.5 h-3.5 text-danger" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-primary" />
              )}
              <span>{expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Scopes & Permissions Granted */}
        {account.scopes && account.scopes.length > 0 && (
          <div className="p-3 rounded-xl bg-sand-light/50 border border-sand-border space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-deep font-semibold">
              <Layers className="w-3.5 h-3.5 text-gold-primary" />
              <span>Granted Permissions & Scopes:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {account.scopes.map((scope) => (
                <span
                  key={scope}
                  className="px-2 py-0.5 rounded-md bg-white border border-sand-border font-mono text-[10px] text-charcoal-muted"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Platform Management Link */}
        <div className="p-3 rounded-xl bg-sand-subtle border border-sand-border flex items-center justify-between">
          <span className="text-charcoal-muted">
            Manage permissions directly in {config.name}:
          </span>
          <a
            href={config.setupGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-primary hover:text-emerald-deep font-semibold"
          >
            <span>Open Settings</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-sand-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onRequestDisconnect(account);
            }}
            disabled={isActionLoading}
            className="text-danger hover:bg-red-50/60 border-red-200"
          >
            Disconnect Account
          </Button>

          <div className="flex items-center gap-2">
            {(account.status === 'expiring_soon' || account.status === 'expired') && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onRefreshAccount(account)}
                disabled={isActionLoading}
              >
                Refresh Token
              </Button>
            )}

            <Button type="button" variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

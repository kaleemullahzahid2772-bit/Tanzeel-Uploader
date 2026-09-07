'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SocialIcon } from '@/components/ai/SocialIcons';
import { SocialPlatform, SocialAccountPublic } from '@/lib/types/database';
import { getOAuthProviderConfig } from '@/lib/oauth/config';
import {
  Shield,
  Clock,
  RotateCcw,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings,
} from 'lucide-react';

interface AccountCardProps {
  platform: SocialPlatform;
  connectedAccounts: SocialAccountPublic[];
  isConfigured: boolean;
  onInitiateConnect: (platform: SocialPlatform) => void;
  onRequestDisconnect: (account: SocialAccountPublic) => void;
  onRefreshAccount: (account: SocialAccountPublic) => void;
  onViewPermissions: (platform: SocialPlatform) => void;
  onViewConfigGuide: (platform: SocialPlatform) => void;
  onManageAccount?: (account: SocialAccountPublic) => void;
  isActionLoading?: boolean;
}

export function AccountCard({
  platform,
  connectedAccounts,
  isConfigured,
  onInitiateConnect,
  onRequestDisconnect,
  onRefreshAccount,
  onViewPermissions,
  onViewConfigGuide,
  onManageAccount,
  isActionLoading = false,
}: AccountCardProps) {
  const config = getOAuthProviderConfig(platform);
  const isConnected = connectedAccounts.length > 0;

  const getStatusBadge = (status: SocialAccountPublic['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="ready" size="sm" className="font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Connected ✓
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge variant="gold" size="sm" className="font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            Needs Reconnection
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="failed" size="sm" className="font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
            Connection Error
          </Badge>
        );
      case 'revoked':
      case 'error':
        return (
          <Badge variant="failed" size="sm" className="font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
            Action Required
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
            Not Connected
          </Badge>
        );
    }
  };

  return (
    <Card
      variant="default"
      className="p-5 flex flex-col justify-between border-sand-border/80 hover:border-gold-primary/40 transition-all duration-200 shadow-sm"
    >
      <div>
        {/* Header: Platform Branding & Global Status */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-sand-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sand-light flex items-center justify-center border border-sand-border shadow-xs">
              <SocialIcon platform={platform} className="w-5 h-5 text-emerald-primary" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-emerald-deep leading-tight">
                {config.name}
              </h3>
              <p className="text-[11px] text-charcoal-muted font-urdu">
                {config.urduName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Badge variant="ready" size="sm">
                🟢 {connectedAccounts.length} Connected
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                ⚪ Not Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Content Body: Connected Accounts List OR Connect Action */}
        <div className="py-4 space-y-3">
          {isConnected ? (
            connectedAccounts.map((account) => {
              const formattedDate = new Date(account.connected_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={account.id}
                  className="p-3.5 rounded-xl bg-sand-light/60 border border-sand-border/70 space-y-2.5 transition-all hover:bg-sand-light"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {account.profile_image_url ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gold-primary/30">
                          <Image
                            src={account.profile_image_url}
                            alt={account.account_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-subtle text-emerald-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {account.account_name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-emerald-deep truncate">
                          {account.account_name}
                        </h4>
                        <p className="text-[11px] text-charcoal-muted truncate font-mono">
                          {account.username ? (account.username.startsWith('@') ? account.username : '@' + account.username) : 'ID: ' + account.account_id}
                        </p>
                      </div>
                    </div>

                    {getStatusBadge(account.status)}
                  </div>

                  {/* Metadata / Expiry Info */}
                  <div className="flex items-center justify-between text-[11px] text-charcoal-light pt-1 border-t border-sand-border/40 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold-primary" />
                      {formattedDate}
                    </span>

                    {account.token_expires_at && (
                      <span
                        className={
                          account.is_expired
                            ? 'text-danger font-semibold'
                            : account.is_expiring_soon
                            ? 'text-gold-deep font-semibold'
                            : 'text-charcoal-muted'
                        }
                      >
                        {account.is_expired
                          ? 'Token Expired'
                          : 'Valid: ' + new Date(account.token_expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Account Card Action Buttons: [ Manage ] [ Disconnect ] */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    {(account.status === 'expiring_soon' || account.status === 'expired') && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onRefreshAccount(account)}
                        disabled={isActionLoading}
                        leftIcon={<RotateCcw className="w-3 h-3 text-gold-primary" />}
                      >
                        Reconnect
                      </Button>
                    )}

                    {onManageAccount && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onManageAccount(account)}
                        disabled={isActionLoading}
                        className="text-emerald-primary hover:bg-emerald-50/60 border-sand-border text-xs"
                        leftIcon={<Settings className="w-3 h-3" />}
                      >
                        Manage
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestDisconnect(account)}
                      disabled={isActionLoading}
                      className="text-danger hover:bg-red-50/60 border-red-200 text-xs"
                      leftIcon={<Trash2 className="w-3 h-3" />}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-xl bg-sand-light/40 border border-dashed border-sand-border text-center space-y-2">
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Connect your official {config.name} account to enable automated publishing and AI management.
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal-light">
                <Shield className="w-3.5 h-3.5 text-emerald-primary" />
                <span>Zero-password Official Facebook OAuth 2.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Add Account / Connect & Info */}
      <div className="pt-3 border-t border-sand-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewPermissions(platform)}
            className="text-[11px] text-emerald-primary hover:text-emerald-deep font-medium flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Permissions</span>
          </button>
          
          <button
            type="button"
            onClick={() => onViewConfigGuide(platform)}
            className="text-[11px] text-charcoal-muted hover:text-emerald-deep font-medium transition-colors"
          >
            Guide
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={isConnected ? 'outline' : 'primary'}
            size="sm"
            onClick={() => onInitiateConnect(platform)}
            disabled={isActionLoading}
            leftIcon={isConnected ? <Plus className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
          >
            {isConnected ? 'Add Page/Channel' : 'Connect ' + config.name.split(' ')[0]}
          </Button>
        </div>
      </div>
    </Card>
  );
}

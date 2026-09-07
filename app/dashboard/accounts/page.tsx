'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SocialPlatform, SocialAccountPublic } from '@/lib/types/database';
import { OAUTH_PROVIDERS, isPlatformConfigured } from '@/lib/oauth/config';
import { AccountCard } from '@/components/social/AccountCard';
import { PermissionsModal } from '@/components/social/PermissionsModal';
import { DisconnectConfirmModal } from '@/components/social/DisconnectConfirmModal';
import { DeveloperConfigGuide } from '@/components/social/DeveloperConfigGuide';
import { ManageAccountModal } from '@/components/social/ManageAccountModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Lock,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';

const ALL_PLATFORMS: SocialPlatform[] = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'whatsapp',
];

export default function SocialAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [accounts, setAccounts] = useState<SocialAccountPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    messageEn: string;
    messageUr: string;
  } | null>(null);

  // Modals state
  const [permissionsPlatform, setPermissionsPlatform] = useState<SocialPlatform | null>(null);
  const [guidePlatform, setGuidePlatform] = useState<SocialPlatform | null>(null);
  const [disconnectAccount, setDisconnectAccount] = useState<SocialAccountPublic | null>(null);
  const [manageAccount, setManageAccount] = useState<SocialAccountPublic | null>(null);

  // 1. Fetch Connected Accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/social-accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Failed to load social accounts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // 2. Process OAuth URL Query Parameters (Success / Error redirects)
  useEffect(() => {
    const connected = searchParams.get('connected');
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const platform = searchParams.get('platform');
    const count = searchParams.get('count');

    if (success === 'true' && connected) {
      const config = OAUTH_PROVIDERS[connected as SocialPlatform];
      const platformName = config ? config.name : connected.toUpperCase();
      const countMsg = count && parseInt(count) > 1 ? ' (' + count + ' Pages/Channels)' : '';

      setNotification({
        type: 'success',
        messageEn: platformName + ' account successfully connected!' + countMsg,
        messageUr: platformName + ' اکاؤنٹ کامیابی کے ساتھ منسلک ہو گیا ہے۔',
      });
      fetchAccounts();

      const timer = setTimeout(() => {
        router.replace('/dashboard/accounts');
      }, 8000);
      return () => clearTimeout(timer);
    }

    if (error) {
      let msgEn = 'OAuth authorization failed. Please try again.';
      let msgUr = 'سوشل اکاؤنٹ کنکشن کا عمل مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں۔';

      if (error === 'user_denied') {
        msgEn = 'Authorization request was cancelled or denied.';
        msgUr = 'آپ نے اجازت مسترد کر دی۔ اکاؤنٹ کنیکٹ نہیں ہوا۔';
      } else if (error === 'missing_credentials') {
        const config = platform ? OAUTH_PROVIDERS[platform as SocialPlatform] : null;
        const pName = config ? config.name : (platform || 'this platform');
        msgEn = pName + ' integration is not configured yet. Please set credentials in .env.local.';
        msgUr = 'اس پلیٹ فارم کے ڈویلپر کلائنٹ کریڈینشلز .env.local میں درج نہیں ہیں۔';
      } else if (error === 'invalid_state' || error === 'state_expired') {
        msgEn = 'OAuth state expired for security protection. Please initiate connection again.';
        msgUr = 'سیکیورٹی اسٹیٹ کی میعاد ختم ہو گئی۔ براہ کرم دوبارہ کنیکٹ بٹن دبائیں۔';
      }

      setNotification({
        type: 'error',
        messageEn: msgEn,
        messageUr: msgUr,
      });

      const timer = setTimeout(() => {
        router.replace('/dashboard/accounts');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, fetchAccounts, router]);

  // 3. Initiate Connection Handler
  const handleInitiateConnect = (platform: SocialPlatform) => {
    setActionLoading(true);
    window.location.href = '/api/oauth/' + platform + '/authorize';
  };

  // 3b. Sandbox Connect Handler (Instant Test Mode)
  const handleSandboxConnect = async (platform: SocialPlatform) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/social-accounts/sandbox-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          messageEn: data.message || 'Connected in Sandbox mode!',
          messageUr: 'اکاؤنٹ ٹیسٹ (Sandbox) موڈ میں کامیابی سے کنیکٹ ہو گیا۔',
        });
        await fetchAccounts();
      } else {
        alert('Sandbox connect failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Sandbox connect error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Disconnect Handler
  const handleConfirmDisconnect = async (account: SocialAccountPublic) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/social-accounts/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id }),
      });

      if (res.ok) {
        setNotification({
          type: 'info',
          messageEn: account.account_name + ' (' + account.platform.toUpperCase() + ') disconnected.',
          messageUr: account.account_name + ' کامیابی سے منقطع (Disconnect) ہو گیا۔',
        });
        setDisconnectAccount(null);
        if (manageAccount?.id === account.id) {
          setManageAccount(null);
        }
        await fetchAccounts();
      } else {
        const data = await res.json();
        alert('Disconnect failed: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Refresh Token Handler
  const handleRefreshAccount = async (account: SocialAccountPublic) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/social-accounts/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id }),
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          messageEn: 'Token refreshed for ' + account.account_name + '!',
          messageUr: account.account_name + ' کے ٹوکن کی کامیابی سے تجدید ہو گئی۔',
        });
        await fetchAccounts();
      } else {
        handleInitiateConnect(account.platform);
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const totalConnected = accounts.length;
  const healthyCount = accounts.filter((a) => a.status === 'connected' && !a.is_expiring_soon).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border/70">
        <div>
          <div className="inline-flex items-center gap-1.5 text-gold-deep text-xs font-mono font-medium mb-1">
            <span>✦</span>
            <span>Phase 4 — Social Accounts Connection & Secure OAuth Engine</span>
            <span>✦</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-deep">
            Connected Social Accounts
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Connect your social media accounts to Nūr Social with AES-256 token encryption and multi-page support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchAccounts}
            disabled={isLoading}
            leftIcon={<RefreshCw className={'w-3.5 h-3.5 ' + (isLoading ? 'animate-spin' : '')} />}
          >
            Refresh List
          </Button>

          <Badge variant="gold" size="md">
            {totalConnected} Connected Accounts
          </Badge>
        </div>
      </div>

      {/* 2. Notification Toast / Banner */}
      {notification && (
        <div
          className={
            'p-4 rounded-xl border flex items-start gap-3 transition-all ' +
            (notification.type === 'success'
              ? 'bg-emerald-50/80 border-emerald-300/80 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-red-50/80 border-red-300/80 text-red-900'
              : 'bg-sand-light border-sand-border text-emerald-deep')
          }
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          )}

          <div className="space-y-0.5 flex-1">
            <p className="text-xs font-bold font-serif">{notification.messageEn}</p>
            <p className="text-xs font-urdu text-charcoal-muted">{notification.messageUr}</p>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs text-charcoal-light hover:text-charcoal-dark font-mono px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Connection Health & Security Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-sand-border/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-subtle flex items-center justify-center text-emerald-primary shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-charcoal-muted font-medium uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="text-xl font-bold font-serif text-emerald-deep">
              {totalConnected}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sand-border/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-subtle flex items-center justify-center text-emerald-primary shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-charcoal-muted font-medium uppercase tracking-wider">
              Healthy & Valid
            </span>
            <div className="text-xl font-bold font-serif text-emerald-deep">
              {healthyCount}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sand-border/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sand-light flex items-center justify-center text-gold-primary shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-charcoal-muted font-medium uppercase tracking-wider">
              Token Security
            </span>
            <div className="text-sm font-bold font-serif text-emerald-deep flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-gold-primary" />
              <span>AES-256 Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Platform Connection Matrix Grid (Focus on Facebook, Instagram, TikTok + Channels) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-emerald-deep">
            Social Media Channels
          </h3>
          <span className="text-xs text-charcoal-muted">
            Connect Facebook Pages, Instagram Professional, TikTok and other channels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_PLATFORMS.map((platform) => {
            const platformAccounts = accounts.filter((a) => a.platform === platform);
            const configured = isPlatformConfigured(platform);

            return (
              <AccountCard
                key={platform}
                platform={platform}
                connectedAccounts={platformAccounts}
                isConfigured={configured}
                onInitiateConnect={handleInitiateConnect}
                onRequestDisconnect={(acc) => setDisconnectAccount(acc)}
                onRefreshAccount={handleRefreshAccount}
                onViewPermissions={(p) => setPermissionsPlatform(p)}
                onViewConfigGuide={(p) => setGuidePlatform(p)}
                onManageAccount={(acc) => setManageAccount(acc)}
                onSandboxConnect={handleSandboxConnect}
                isActionLoading={actionLoading}
              />
            );
          })}
        </div>
      </div>

      {/* 5. Phase 5 Publishing Readiness Info Callout */}
      <div className="p-5 rounded-2xl bg-sand-light/50 border border-sand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-subtle text-emerald-primary flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-gold-primary" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-deep">
              Next Stage: Phase 5 Automated Publishing Engine
            </h4>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              The connected accounts and tokens secured here in Phase 4 allow Phase 5 to automatically publish and schedule your approved content across all selected platforms.
            </p>
          </div>
        </div>

        <Badge variant="outline" size="sm" className="self-start sm:self-auto shrink-0 font-mono">
          Phase 4 Active
        </Badge>
      </div>

      {/* 6. Modals */}
      <PermissionsModal
        platform={permissionsPlatform}
        isOpen={Boolean(permissionsPlatform)}
        onClose={() => setPermissionsPlatform(null)}
        onProceedConnect={handleInitiateConnect}
        onSandboxConnect={handleSandboxConnect}
      />

      <DisconnectConfirmModal
        account={disconnectAccount}
        isOpen={Boolean(disconnectAccount)}
        isLoading={actionLoading}
        onClose={() => setDisconnectAccount(null)}
        onConfirmDisconnect={handleConfirmDisconnect}
      />

      <ManageAccountModal
        account={manageAccount}
        isOpen={Boolean(manageAccount)}
        onClose={() => setManageAccount(null)}
        onRequestDisconnect={(acc) => setDisconnectAccount(acc)}
        onRefreshAccount={handleRefreshAccount}
        isActionLoading={actionLoading}
      />

      <DeveloperConfigGuide
        platform={guidePlatform}
        isOpen={Boolean(guidePlatform)}
        onClose={() => setGuidePlatform(null)}
      />
    </div>
  );
}

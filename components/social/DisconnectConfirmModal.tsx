'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SocialAccountPublic } from '@/lib/types/database';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

interface DisconnectConfirmModalProps {
  account: SocialAccountPublic | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirmDisconnect: (account: SocialAccountPublic) => void;
}

export function DisconnectConfirmModal({
  account,
  isOpen,
  isLoading,
  onClose,
  onConfirmDisconnect,
}: DisconnectConfirmModalProps) {
  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Disconnect Social Account"
      maxWidth="md"
    >
      <div className="space-y-4 font-sans">
        <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="text-xs text-danger leading-relaxed">
            <p className="font-bold font-serif mb-0.5">
              کیا آپ واقعی یہ اکاؤنٹ ڈس کنیکٹ کرنا چاہتے ہیں؟
            </p>
            <p className="text-charcoal-muted">
              Are you sure you want to disconnect <strong className="text-emerald-deep">{account.account_name}</strong> ({account.platform.toUpperCase()})?
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-sand-light/50 border border-sand-border/70 text-xs text-charcoal-muted space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-deep font-semibold">
            <ShieldAlert className="w-4 h-4 text-gold-primary" />
            <span>What happens when you disconnect:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
            <li>Encrypted access and refresh tokens will be permanently purged from database.</li>
            <li>Future Phase 5 publishing will not be able to target this page/channel until re-authorized.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onConfirmDisconnect(account)}
            disabled={isLoading}
            className="bg-danger hover:bg-red-700 text-white border-red-700"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            {isLoading ? 'Disconnecting...' : 'Yes, Disconnect Account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

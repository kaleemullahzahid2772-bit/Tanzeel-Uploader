'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { MediaItem } from '@/lib/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedMediaId: string) => void;
}

export function DeleteConfirmModal({
  media,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const { isConfigured, isDemoMode } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  if (!media) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      if (!isConfigured || isDemoMode) {
        // Remove from localStorage
        const stored = localStorage.getItem('nur_demo_media');
        if (stored) {
          const list: MediaItem[] = JSON.parse(stored);
          const filtered = list.filter((item) => item.id !== media.id);
          localStorage.setItem('nur_demo_media', JSON.stringify(filtered));
        }
        onSuccess(media.id);
        onClose();
      } else {
        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([media.file_path]);

        if (storageError) {
          console.warn('Could not remove file from storage:', storageError);
        }

        // 2. Delete row from PostgreSQL 'media' table
        const { error: dbError } = await supabase
          .from('media')
          .delete()
          .eq('id', media.id);

        if (dbError) throw dbError;

        onSuccess(media.id);
        onClose();
      }
    } catch (err: unknown) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">
              Are you sure you want to delete this media?
            </p>
            <p className="mt-1 text-rose-700">
              This will permanently delete <span className="font-mono font-semibold">"{media.file_name}"</span> and remove it from Supabase storage. This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
          >
            Delete Media
          </Button>
        </div>
      </div>
    </Modal>
  );
}

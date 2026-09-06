'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { MediaType, MediaItem } from '@/lib/types/database';
import { formatBytes } from '@/lib/utils/formatters';
import { Button } from '@/lib/../components/ui/Button';
import { Upload, Film, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MediaDropzoneProps {
  onUploadSuccess?: (media: MediaItem) => void;
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime', // .mov
];

export function MediaDropzone({ onUploadSuccess, className }: MediaDropzoneProps) {
  const { user, isDemoMode, isConfigured } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setSuccess(null);

    // Validation 1: MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setError('Unsupported file type. Please upload JPG, PNG, WEBP, MP4, or MOV files.');
      return;
    }

    // Validation 2: Size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${formatBytes(file.size)}). Maximum allowed size is 50 MB.`);
      return;
    }

    setUploading(true);
    setProgress(20);

    const isVideo = file.type.startsWith('video/');
    const fileType: MediaType = isVideo ? 'video' : 'image';
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user?.id || 'demo_user'}/${timestamp}_${cleanFileName}`;

    try {
      let publicUrl = '';

      if (!isConfigured || isDemoMode) {
        // Instant Demo / Sandbox Mode Upload Simulation
        setProgress(60);
        publicUrl = URL.createObjectURL(file);
        
        const demoMediaItem: MediaItem = {
          id: `media_${timestamp}`,
          user_id: user?.id || '00000000-0000-0000-0000-000000000001',
          file_name: file.name,
          file_path: storagePath,
          public_url: publicUrl,
          file_type: fileType,
          mime_type: file.type,
          file_size: file.size,
          width: isVideo ? 1920 : 1080,
          height: 1080,
          duration: isVideo ? 15 : null,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Save demo media to localStorage
        const stored = localStorage.getItem('nur_demo_media');
        const list: MediaItem[] = stored ? JSON.parse(stored) : [];
        list.unshift(demoMediaItem);
        localStorage.setItem('nur_demo_media', JSON.stringify(list));

        setProgress(100);
        setSuccess(`"${file.name}" uploaded successfully!`);
        if (onUploadSuccess) onUploadSuccess(demoMediaItem);
      } else {
        // Production Supabase Storage Upload
        setProgress(40);
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        setProgress(70);

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(storagePath);

        publicUrl = urlData.publicUrl;

        // Insert metadata into PostgreSQL 'media' table
        const { data: mediaRecord, error: dbError } = await supabase
          .from('media')
          .insert({
            user_id: user?.id,
            file_name: file.name,
            file_path: storagePath,
            public_url: publicUrl,
            file_type: fileType,
            mime_type: file.type,
            file_size: file.size,
            status: 'ready',
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setProgress(100);
        setSuccess(`"${file.name}" uploaded successfully!`);
        if (onUploadSuccess && mediaRecord) onUploadSuccess(mediaRecord);
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => {
        setProgress(0);
        setSuccess(null);
      }, 4000);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-gold-primary bg-gold-subtle/50 scale-[1.01]'
            : 'border-sand-border hover:border-emerald-primary/40 bg-sand-ivory/60 hover:bg-sand-cream/40'
        } ${uploading ? 'opacity-80 pointer-events-none' : ''}`}
      >
        {/* Subtle Background Geometric Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-gold-primary/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-gold-primary/30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gold-primary/30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gold-primary/30" />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          {/* Islamic Star Badge with Icon */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-subtle/80 border border-emerald-border/30 flex items-center justify-center text-emerald-primary shadow-xs">
              <Upload className="w-6 h-6 animate-pulseSubtle" />
            </div>
            {/* Islamic 8-point gold accent */}
            <div className="absolute -top-1.5 -right-1.5 text-gold-primary text-sm font-serif select-none">
              ✦
            </div>
          </div>

          <h4 className="font-serif text-lg font-bold text-emerald-deep tracking-tight">
            Upload Your Content
          </h4>

          <p className="text-sm text-charcoal-muted mt-1.5">
            Drag &amp; drop your media here, or browse from your device
          </p>

          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-charcoal-light mt-4 pt-4 border-t border-sand-border/50">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-medium" /> JPG, PNG, WEBP
            </span>
            <span className="text-sand-border">•</span>
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-gold-primary" /> MP4, MOV (Max 50MB)
            </span>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full mt-5">
              <div className="flex justify-between text-xs text-charcoal-muted mb-1 font-mono">
                <span>Uploading to Media Storage...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-sand-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-primary to-gold-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error / Success Notifications */}
      {error && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{success}</span>
        </div>
      )}
    </div>
  );
}

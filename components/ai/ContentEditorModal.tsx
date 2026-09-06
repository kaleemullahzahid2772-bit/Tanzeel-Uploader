'use client';

import React, { useState, useEffect } from 'react';
import { SocialPlatform, PlatformContentData } from '@/lib/types/database';
import { PLATFORM_INFO } from './PlatformTabs';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Check } from 'lucide-react';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: SocialPlatform;
  initialContent: PlatformContentData;
  onSave: (updated: PlatformContentData) => void;
}

export function ContentEditorModal({
  isOpen,
  onClose,
  platform,
  initialContent,
  onSave,
}: ContentEditorModalProps) {
  const [title, setTitle] = useState(initialContent.title || '');
  const [hook, setHook] = useState(initialContent.hook || '');
  const [caption, setCaption] = useState(initialContent.caption || '');
  const [description, setDescription] = useState(initialContent.description || '');
  const [hashtagsStr, setHashtagsStr] = useState((initialContent.hashtags || []).join(' '));
  const [keywordsStr, setKeywordsStr] = useState((initialContent.keywords || []).join(', '));
  const [tagsStr, setTagsStr] = useState((initialContent.tags || []).join(', '));
  const [cta, setCta] = useState(initialContent.cta || '');

  useEffect(() => {
    setTitle(initialContent.title || '');
    setHook(initialContent.hook || '');
    setCaption(initialContent.caption || '');
    setDescription(initialContent.description || '');
    setHashtagsStr((initialContent.hashtags || []).join(' '));
    setKeywordsStr((initialContent.keywords || []).join(', '));
    setTagsStr((initialContent.tags || []).join(', '));
    setCta(initialContent.cta || '');
  }, [initialContent]);

  const info = PLATFORM_INFO[platform];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse hashtags
    const parsedHashtags = hashtagsStr
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    // Parse keywords
    const parsedKeywords = keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    // Parse tags
    const parsedTags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: PlatformContentData = {
      ...initialContent,
      title: title.trim() || undefined,
      hook: hook.trim() || undefined,
      caption: caption.trim() || undefined,
      description: description.trim() || undefined,
      hashtags: parsedHashtags.length > 0 ? parsedHashtags : undefined,
      keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
      cta: cta.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  const tweetLength = caption.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Content — ${info.name}`}
      description={`Manually refine the generated copy and metadata for ${info.urduName}.`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-4 mt-2">
        {/* Title (for platforms with title support) */}
        {(platform === 'youtube' || platform === 'facebook' || platform === 'whatsapp') && (
          <Input
            label="Title / Heading"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post or video title..."
          />
        )}

        {/* Hook (for Instagram / TikTok) */}
        {(platform === 'instagram' || platform === 'tiktok') && (
          <Input
            label="Hook / First Line (Opening statement)"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            placeholder="Scroll-stopping hook statement..."
          />
        )}

        {/* Main Caption */}
        {platform !== 'youtube' && (
          <div>
            <Textarea
              label="Main Caption / Post Text"
              rows={6}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter post text..."
              helperText={
                platform === 'twitter'
                  ? `Character count: ${tweetLength} / 280 ${tweetLength > 280 ? '(EXCEEDS LIMIT)' : ''}`
                  : undefined
              }
            />
          </div>
        )}

        {/* Video Description (for YouTube) */}
        {platform === 'youtube' && (
          <Textarea
            label="YouTube Video Description & Timestamps"
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description, timestamps, and channel info..."
          />
        )}

        {/* Hashtags */}
        <div>
          <Input
            label="Hashtags (Space separated)"
            value={hashtagsStr}
            onChange={(e) => setHashtagsStr(e.target.value)}
            placeholder="#IslamicReminder #NurSocial #Reflection"
          />
        </div>

        {/* Keywords & Tags (for TikTok / YouTube) */}
        {(platform === 'tiktok' || platform === 'youtube') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Keywords (Comma separated)"
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              placeholder="faith, spiritual growth, reminder"
            />
            {platform === 'youtube' && (
              <Input
                label="Tags (Comma separated)"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="Islamic lectures, Quran, Urdu"
              />
            )}
          </div>
        )}

        {/* Call to Action */}
        <Input
          label="Call To Action (CTA)"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          placeholder="e.g., Save this post, Share with friends, Visit website..."
        />

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Check className="w-4 h-4 text-gold-light" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

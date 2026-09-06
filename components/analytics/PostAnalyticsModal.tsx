'use client';

import React from 'react';
import { PostAnalytics } from '@/lib/types/database';
import { 
  X, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Share2
} from 'lucide-react';

interface PostAnalyticsModalProps {
  post: PostAnalytics | null;
  onClose: () => void;
}

export function PostAnalyticsModal({ post, onClose }: PostAnalyticsModalProps) {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121E19] border border-emerald-900/20 dark:border-emerald-700/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
              {post.platform}
            </span>
            {post.published_at && (
              <span className="text-xs text-gray-500 font-mono">
                Published on {new Date(post.published_at).toLocaleString()}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {post.post_title || post.post_topic || 'Post Performance Deep-Dive'}
          </h3>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-emerald-400">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Views</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {post.views.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/30 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-amber-400">
              <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
              <span>Likes</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {post.likes.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/30 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-blue-400">
              <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Comments</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {post.comments.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-800/30 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-purple-400">
              <Share2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Shares</span>
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {post.shares.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Extended Telemetry (Reach, Impressions, Engagement Rate) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-emerald-400/80">
            Platform Telemetry Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#172721] flex items-center justify-between">
              <span className="text-gray-500">Total Reach (منفرد افراد):</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{post.reach.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#172721] flex items-center justify-between">
              <span className="text-gray-500">Impressions (مجموعی نمائش):</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{post.impressions.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#172721] flex items-center justify-between">
              <span className="text-gray-500">Engagement Rate:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{post.engagement_rate.toFixed(2)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#172721] flex items-center justify-between">
              <span className="text-gray-500">Content Format:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white capitalize">{post.content_type}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-emerald-900/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors shadow-md shadow-emerald-900/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

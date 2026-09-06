'use client';

import React, { useState } from 'react';
import { PostAnalytics, PostSortOption } from '@/lib/types/database';
import { 
  Trophy, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Search, 
  ArrowUpDown
} from 'lucide-react';

interface TopPostsSectionProps {
  posts: PostAnalytics[];
  onSelectPost: (post: PostAnalytics) => void;
  loading?: boolean;
}

export function TopPostsSection({ posts, onSelectPost, loading = false }: TopPostsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<PostSortOption>('views');

  // Filter & Sort
  const filtered = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.post_title && p.post_title.toLowerCase().includes(q)) ||
      (p.post_topic && p.post_topic.toLowerCase().includes(q)) ||
      p.platform.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'views': return b.views - a.views;
      case 'likes': return b.likes - a.likes;
      case 'comments': return b.comments - a.comments;
      case 'shares': return b.shares - a.shares;
      case 'engagement': return b.engagement_rate - a.engagement_rate;
      case 'date': return new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime();
      default: return b.views - a.views;
    }
  });

  return (
    <div className="bg-white dark:bg-[#111C18] rounded-2xl p-5 sm:p-6 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Performing Islamic Posts & Content
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-urdu">
            سب سے زیادہ مقبول اور اثر انگیز پوسٹس کی رینکنگ
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search post caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#162520] border border-gray-200 dark:border-emerald-800/30 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PostSortOption)}
              className="px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-[#162520] border border-gray-200 dark:border-emerald-800/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="views">Sort: Views (ویوز)</option>
              <option value="engagement">Sort: Engagement Rate (انگیجمنٹ)</option>
              <option value="likes">Sort: Likes (پسندیدگی)</option>
              <option value="comments">Sort: Comments (تبصرے)</option>
              <option value="shares">Sort: Shares (شیئرز)</option>
              <option value="date">Sort: Published Date (تاریخ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Cards / Grid */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-emerald-950/30 animate-pulse rounded-2xl" />
          ))
        ) : sorted.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-emerald-800/30 rounded-2xl space-y-1">
            <p>No published posts matching your criteria.</p>
            <p className="font-urdu text-[11px]">اس فلٹر پر کوئی پوسٹ دستیاب نہیں ہے۔</p>
          </div>
        ) : (
          sorted.map((post, index) => {
            const rank = index + 1;

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/60 dark:bg-[#15241F] border border-gray-100 dark:border-emerald-800/20 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all gap-4"
              >
                {/* Left: Rank & Info */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className={'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ' + (
                    rank === 1
                      ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-500/20'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-900'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-200 dark:bg-emerald-900/40 text-gray-700 dark:text-gray-300'
                  )}>
                    #{rank}
                  </div>

                  {/* Platform & Caption */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        {post.platform}
                      </span>
                      {post.published_at && (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {new Date(post.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {post.post_title || post.post_topic || 'Islamic Social Media Update'}
                    </p>
                  </div>
                </div>

                {/* Right: Metrics Pills */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono self-end sm:self-center flex-shrink-0">
                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300" title="Views">
                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300" title="Likes">
                    <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>{post.likes.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300" title="Comments">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>{post.comments.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300" title="Shares">
                    <Share2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>{post.shares.toLocaleString()}</span>
                  </div>

                  {/* Engagement Rate Badge */}
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300/40">
                    {post.engagement_rate.toFixed(2)}% ER
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

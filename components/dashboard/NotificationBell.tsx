'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { InAppNotification } from '@/lib/types/database';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.status === 401) {
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore network errors in polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // 25s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-gold-deep shrink-0 mt-0.5" />;
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            handleMarkAllRead();
          }
        }}
        className="relative p-2 text-charcoal-muted hover:text-emerald-deep hover:bg-sand-muted rounded-xl transition-colors select-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-sand-ivory rounded-2xl shadow-elevated border border-sand-border py-2 z-50 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-sand-border/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-deep font-mono uppercase tracking-wider">
                Notifications (اطلاعات)
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gold-subtle text-gold-deep border border-gold-border font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-charcoal-muted hover:text-emerald-primary flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-sand-border/40">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal-muted">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start gap-2.5 ${
                    notif.is_read ? 'hover:bg-sand-cream/40' : 'bg-gold-subtle/20 hover:bg-gold-subtle/30'
                  }`}
                >
                  {getIcon(notif.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-semibold text-emerald-deep truncate">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] font-mono text-charcoal-light shrink-0">
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-charcoal-muted mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-primary hover:text-emerald-deep hover:underline mt-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

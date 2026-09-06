'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getIslamicGreeting, getFormattedHijriDate, formatDate } from '@/lib/utils/formatters';
import { Menu, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, profile, isDemoMode, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { greeting } = getIslamicGreeting();
  const hijriDate = getFormattedHijriDate();
  const gregorianDate = formatDate(new Date().toISOString());

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Marketing Lead';
  const role = profile?.role || 'admin';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-sand-ivory/95 backdrop-blur-md border-b border-sand-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Greetings */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-emerald-deep hover:bg-sand-muted rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-base sm:text-lg font-bold text-emerald-deep tracking-tight flex items-center gap-1.5">
              <span>{greeting},</span>
              <span className="text-emerald-primary">{displayName}</span>
            </h1>
            {isDemoMode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-subtle text-gold-deep border border-gold-border font-semibold">
                Sandbox Mode
              </span>
            )}
          </div>
          <p className="hidden sm:block text-xs text-charcoal-muted">
            Manage your social media content intelligently.
          </p>
        </div>
      </div>

      {/* Right: Dates & Profile Menu */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Gregorian & Hijri Date Badge */}
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-emerald-deep">
            {gregorianDate}
          </span>
          <span className="text-[11px] font-mono text-gold-deep flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-primary inline-block" />
            {hijriDate}
          </span>
        </div>

        <div className="h-7 w-px bg-sand-border/80 hidden md:block" />

        {/* In-App Notification Bell */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-sand-cream/80 transition-colors border border-transparent hover:border-sand-border select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-primary to-emerald-dark text-sand-ivory flex items-center justify-center font-serif font-bold text-sm shadow-xs border border-gold-primary/30">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-emerald-deep leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] font-mono text-gold-dark uppercase tracking-wider">
                {role}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-charcoal-light hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-sand-ivory rounded-2xl shadow-elevated border border-sand-border py-2 z-50 animate-fadeIn overflow-hidden">
              <div className="px-4 py-2.5 border-b border-sand-border/50">
                <p className="text-xs font-semibold text-emerald-deep truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-charcoal-muted truncate mt-0.5">
                  {user?.email || profile?.email || 'user@nursocial.ai'}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-primary uppercase">
                  <Shield className="w-3 h-3 text-gold-primary" />
                  <span>Role: {role}</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-main hover:text-emerald-primary hover:bg-sand-muted/50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-charcoal-muted" />
                  <span>Profile &amp; Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-sand-border/50">
                <button
                  type="button"
                  onClick={async () => {
                    setDropdownOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

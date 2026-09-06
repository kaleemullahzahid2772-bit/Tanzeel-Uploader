'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/islamic/BrandMark';
import { cn } from '@/lib/utils/formatters';
import {
  LayoutDashboard,
  PlusSquare,
  Image as ImageIcon,
  Calendar,
  Share2,
  Send,
  BarChart3,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'gold' | 'muted';
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Create Post',
      href: '/dashboard/create-post',
      icon: PlusSquare,
    },
    {
      label: 'Media Library',
      href: '/dashboard/media',
      icon: ImageIcon,
    },
    {
      label: 'Publishing',
      href: '/dashboard/publishing',
      icon: Send,
      badge: 'Phase 5',
      badgeVariant: 'gold',
    },
    {
      label: 'Accounts',
      href: '/dashboard/accounts',
      icon: Share2,
      badge: 'Phase 4',
      badgeVariant: 'gold',
    },
    {
      label: 'Calendar',
      href: '/dashboard/calendar',
      icon: Calendar,
      badge: 'Phase 6',
      badgeVariant: 'gold',
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      badge: 'Phase 7',
      badgeVariant: 'gold',
    },
    {
      label: 'AI Marketing',
      href: '/dashboard/ai-marketing',
      icon: Sparkles,
      badge: 'Phase 8',
      badgeVariant: 'gold',
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-emerald-deep text-sand-ivory border-r border-emerald-border/40 select-none relative overflow-hidden">
      {/* Subtle Islamic Background Star Accent in Sidebar Footer */}
      <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-5 pointer-events-none text-gold-light">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 7.5L20 7.5L16.5 12L20 16.5L14.5 16.5L12 22L9.5 16.5L4 16.5L7.5 12L4 7.5L9.5 7.5Z" />
        </svg>
      </div>

      {/* Top Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-emerald-border/30">
        <BrandMark theme="dark" size="md" />
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden text-sand-muted hover:text-sand-ivory p-1.5 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-gold-light/60 font-medium">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-primary text-gold-light shadow-sm border border-gold-primary/30'
                  : 'text-sand-muted/80 hover:text-sand-ivory hover:bg-emerald-dark/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-gold-light' : 'text-sand-muted/60 group-hover:text-gold-light/80'
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    'text-[9px] font-mono px-1.5 py-0.5 rounded-xs tracking-wide uppercase',
                    item.badgeVariant === 'gold'
                      ? 'bg-gold-subtle text-gold-deep border border-gold-border'
                      : 'bg-emerald-dark/80 text-sand-muted/50 border border-emerald-border/20'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Islamic Aesthetics Footer Banner */}
      <div className="p-4 m-3 bg-emerald-dark/70 rounded-xl border border-gold-primary/20 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-gold-light text-xs font-serif font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold-primary" />
          <span>Nūr Social Engine</span>
        </div>
        <p className="text-[11px] text-sand-muted/70 mt-1 leading-snug">
          Phase 1 Foundation • Islamic SaaS Architecture
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-emerald-deep/70 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 z-50 lg:hidden transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

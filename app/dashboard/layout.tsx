'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { IslamicPattern } from '@/components/islamic/IslamicPattern';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-ivory flex flex-col items-center justify-center gap-3">
        <IslamicPattern variant="subtle" opacity={0.03} />
        <Loader2 className="w-8 h-8 text-emerald-primary animate-spin" />
        <p className="text-xs font-serif text-emerald-deep tracking-wider">
          Loading Nūr Social...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sand-ivory flex flex-col lg:flex-row antialiased relative">
      {/* Background Subtle Pattern */}
      <IslamicPattern variant="subtle" opacity={0.025} />

      {/* Sidebar (Desktop & Mobile) */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative z-10">
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}

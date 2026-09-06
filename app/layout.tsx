import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';

export const metadata: Metadata = {
  title: 'Nūr Social — AI-Powered Islamic Social Media Management',
  description:
    'Intelligent multi-platform social media management designed with Islamic SaaS elegance. Upload once, manage seamlessly across channels.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sand-ivory text-charcoal-main font-sans selection:bg-emerald-primary/20 selection:text-emerald-deep">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

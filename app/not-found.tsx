import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-serif font-bold text-[#0F4C3A] mb-3">404 - Page Not Found</h1>
      <p className="text-[#18201C]/70 text-sm max-w-md mb-6">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 bg-[#0F4C3A] text-[#FFFDF7] rounded-xl text-sm font-semibold hover:bg-[#083B2E] transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

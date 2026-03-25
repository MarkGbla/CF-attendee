import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-pink via-brand-pink-light to-brand-purple">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-white/80 text-lg mb-8">
          This page doesn&apos;t exist
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-white text-brand-pink font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

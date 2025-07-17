"use client";
import Link from 'next/link';
import ChatWidget from "./ChatWidget";
// Placeholder for a hero icon (replace with your own SVG or icon component)
const HeroIcon = () => (
  <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mx-auto mb-4">
    <circle cx="32" cy="32" r="32" fill="#2563eb" />
    <path d="M32 16a16 16 0 100 32 16 16 0 000-32zm0 28a12 12 0 110-24 12 12 0 010 24z" fill="#fff" />
    <rect x="28" y="24" width="8" height="16" rx="4" fill="#2563eb" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-xl w-full flex flex-col items-center border border-gray-200">
        <HeroIcon />
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Voice Intelligence App</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Upload, transcribe, and analyze your conversations with AI-powered insights.<br />
          Get sentiment, summaries, and more from your audio files instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-lg w-full sm:w-auto text-center">
            Upload Audio
          </Link>
          <Link href="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition text-lg w-full sm:w-auto text-center">
            View Dashboard
          </Link>
        </div>
      </div>
      <div className="mt-10 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Voice Intelligence App. All rights reserved.
      </div>
      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#3D2817] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <Link
            href="/help"
            className="text-sm md:text-base hover:text-[#40E0D0] transition-colors underline"
          >
            Help & Support
          </Link>
          <span className="hidden md:inline text-[#40E0D0]">|</span>
          <Link
            href="/privacy"
            className="text-sm md:text-base hover:text-[#40E0D0] transition-colors underline"
          >
            Privacy Policy
          </Link>
          <span className="hidden md:inline text-[#40E0D0]">|</span>
          <Link
            href="/terms"
            className="text-sm md:text-base hover:text-[#40E0D0] transition-colors underline"
          >
            Terms of Service
          </Link>
        </div>
        <div className="mt-4 text-center text-xs md:text-sm text-white/70">
          © {new Date().getFullYear()} Pray It Forward. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


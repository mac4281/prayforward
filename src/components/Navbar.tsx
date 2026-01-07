'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-[#40E0D0] w-full px-4 py-4 md:py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <Image
              src="/PIF-black.png"
              alt="Pray It Forward"
              width={180}
              height={54}
              priority
              className="object-contain h-12 md:h-14 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            <Link
              href="https://pray-forward.printify.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D2817] font-bold text-sm md:text-base hover:underline"
            >
              Merch
            </Link>
            <Link
              href="/pray"
              className="text-[#3D2817] font-bold text-sm md:text-base hover:underline"
            >
              Pray
            </Link>
            <Link
              href="/about"
              className="text-[#3D2817] font-bold text-sm md:text-base hover:underline"
            >
              About us
            </Link>
            <Link
              href="/support"
              className="text-[#3D2817] font-bold text-sm md:text-base hover:underline"
            >
              Support our mission
            </Link>
            <Link
              href="/request"
              className="text-[#3D2817] font-bold text-sm md:text-base hover:underline"
            >
              Add a prayer request
            </Link>
          </div>
          
          {/* Right side - Desktop: Account link and App Store, Mobile: Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop Account and App Store */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/profile"
                className="text-[#3D2817] font-bold text-sm md:text-base hover:underline"
              >
                Account
              </Link>
              <Link
                href="https://apps.apple.com/us/app/pray-it-forward/id6757207986"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/395837460.png"
                  alt="Download on the App Store"
                  width={120}
                  height={40}
                  className="h-8 md:h-10 w-auto object-contain"
                  unoptimized
                />
              </Link>
            </div>
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#3D2817] p-2"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        >
          <div
            className="bg-[#40E0D0] w-full h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-6 space-y-4">
              {/* Close button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] p-2"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-4">
                <Link
                  href="https://pray-forward.printify.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] font-bold text-lg py-3 border-b border-[#3D2817]/20"
                >
                  Merch
                </Link>
                <Link
                  href="/pray"
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] font-bold text-lg py-3 border-b border-[#3D2817]/20"
                >
                  Pray
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] font-bold text-lg py-3 border-b border-[#3D2817]/20"
                >
                  About us
                </Link>
                <Link
                  href="/support"
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] font-bold text-lg py-3 border-b border-[#3D2817]/20"
                >
                  Support our mission
                </Link>
                <Link
                  href="/request"
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] font-bold text-lg py-3 border-b border-[#3D2817]/20"
                >
                  Add a prayer request
                </Link>
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="text-[#3D2817] font-bold text-lg py-3 border-b border-[#3D2817]/20"
                >
                  Account
                </Link>
                <Link
                  href="https://apps.apple.com/us/app/pray-it-forward/id6757207986"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center py-3 border-b border-[#3D2817]/20"
                  aria-label="Download on the App Store"
                >
                  <Image
                    src="/395837460.png"
                    alt="Download on the App Store"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                    unoptimized
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

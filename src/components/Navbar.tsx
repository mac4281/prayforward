'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-[#40E0D0] w-full px-4 py-4 md:py-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/PIF-black.png"
            alt="Pray It Forward"
            width={180}
            height={54}
            priority
            className="object-contain h-12 md:h-14 w-auto"
          />
        </Link>
        
        {/* Center - Navigation Links */}
        <div className="flex items-center gap-4 md:gap-6">
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
        
        {/* Right side - Account link and App Store */}
        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
}

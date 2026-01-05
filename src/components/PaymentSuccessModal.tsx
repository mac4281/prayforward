'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface PaymentSuccessModalProps {
  onClose: () => void;
}

export default function PaymentSuccessModal({ onClose }: PaymentSuccessModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 md:p-8 border border-[#3D2817]/10">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-2">
              Thank You!
            </h2>
            <p className="text-[#3D2817] text-base md:text-lg">
              Your payment was successful. We appreciate your support!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                router.push('/pray');
                onClose();
              }}
              className="w-full bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors"
            >
              Keep Praying
            </button>

            <Link
              href="https://apps.apple.com/us/app/pray-it-forward/id6757207986"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="block w-full"
            >
              <div className="w-full bg-white border-2 border-[#3D2817] text-[#3D2817] px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#F5F5DC] transition-colors flex items-center justify-center gap-2">
                <span>Download the App</span>
                <Image
                  src="/395837460.png"
                  alt="Download on the App Store"
                  width={100}
                  height={33}
                  className="h-6 w-auto object-contain"
                  unoptimized
                />
              </div>
            </Link>

            <button
              onClick={onClose}
              className="w-full text-[#3D2817] px-6 py-2 text-base hover:underline"
            >
              Stay on this page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


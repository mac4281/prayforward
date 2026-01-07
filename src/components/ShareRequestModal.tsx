'use client';

import { useEffect } from 'react';
import ShareButton from './ShareButton';

interface ShareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  prayerText: string;
}

export default function ShareRequestModal({
  isOpen,
  onClose,
  requestId,
  prayerText,
}: ShareRequestModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-[#3D2817]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-3">
              Share Your Prayer Request
            </h2>
            <p className="text-[#3D2817] text-base md:text-lg">
              Help spread your prayer request by sharing it with others. The more people who see it, the more prayers you'll receive!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <ShareButton requestId={requestId} prayerText={prayerText} />
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-[#3D2817] text-[#3D2817] rounded-lg font-semibold hover:bg-[#3D2817] hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-sm text-[#3D2817]/70">
            You can always share this request later from the prayer request page.
          </p>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';

interface ShareButtonProps {
  requestId: string;
  prayerText: string;
}

export default function ShareButton({ requestId, prayerText }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      // Encode prayer text for URL
      const encodedText = encodeURIComponent(prayerText);
      const imageUrl = `/api/share-image/${requestId}?text=${encodedText}`;
      
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Share image error:', errorText);
        throw new Error('Failed to generate share image');
      }
      
      const blob = await response.blob();
      const file = new File([blob], `prayer-request-${requestId}.png`, { type: 'image/png' });
      
      // Get the prayer request URL (use production domain or current origin)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const requestUrl = `${baseUrl}/${requestId}`;

      // Use Web Share API if available
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Prayer Request',
            text: prayerText.substring(0, 100) + (prayerText.length > 100 ? '...' : ''),
            url: requestUrl,
            files: [file],
          });
        } catch (shareError: any) {
          // If share fails, fall back to download
          if (shareError.name !== 'AbortError') {
            downloadImage(imageUrl, requestUrl);
          }
        }
      } else {
        // Fallback: download the image
        downloadImage(imageUrl, requestUrl);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share prayer request. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const downloadImage = (url: string, requestUrl: string) => {
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = url;
    link.download = `prayer-request-${requestId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Also copy the link to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(requestUrl).then(() => {
        // Optionally show a toast notification
        console.log('Prayer request link copied to clipboard');
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="flex items-center gap-2 px-4 py-2 bg-[#40E0D0] text-[#3D2817] rounded-lg font-semibold hover:bg-[#30c0b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {sharing ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Sharing...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
        </>
      )}
    </button>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAnonymousUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import PrayerForm from '@/components/PrayerForm';
import CompanyAd from '@/components/CompanyAd';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

interface PrayerRequest {
  id: string;
  text?: string;
  name?: string;
  [key: string]: any;
}

export default function PrayerRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [prayerRequest, setPrayerRequest] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPrayerRequest() {
      if (!db || !id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Authenticate user first before reading from Firestore
        await getAnonymousUser();

        // Now fetch the prayer request
        const docRef = doc(db, 'prayerRequests', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPrayerRequest({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          setError(true);
        }
      } catch (err: any) {
        console.error('Error fetching prayer request:', err);
        // Check if it's a permission error
        if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
          console.error('Permission denied. Make sure Firestore rules allow authenticated reads.');
        }
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-2xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#3D2817] text-lg">Loading prayer request...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !prayerRequest) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-2xl mx-auto w-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3D2817]">
              Prayer Request Not Found
            </h1>
            <p className="text-[#3D2817] text-lg md:text-xl">
              The prayer request you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#3D2817] text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors"
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      
      <main className="flex-1 px-4 md:px-6 py-8 max-w-xl mx-auto w-full">
        <div className="space-y-8">
          {/* Prayer Request Card */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
            <h1 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-4">
              Prayer Request
            </h1>
            
            <div className="prose prose-lg max-w-none">
              {prayerRequest.text && (
                <p className="text-[#3D2817] text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {prayerRequest.text}
                </p>
              )}
              
              {prayerRequest.name && (
                <p className="text-[#3D2817] text-base md:text-lg leading-relaxed mt-4 font-medium">
                  {prayerRequest.name}
                </p>
              )}
            </div>

            {/* Share Button */}
            {prayerRequest.text && (
              <div className="mt-6 flex justify-end">
                <ShareButton 
                  requestId={prayerRequest.id} 
                  prayerText={prayerRequest.text}
                />
              </div>
            )}
          </div>

          {/* Prayer Form */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
            <PrayerForm 
              requestId={id} 
              onSuccess={() => {
                // Redirect to /pray after successful prayer submission
                router.push('/pray');
              }}
            />
          </div>

          {/* Company Ad */}
          <CompanyAd />
        </div>
      </main>
    </div>
  );
}


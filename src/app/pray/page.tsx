'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAnonymousUser } from '@/lib/auth';
import { getSessionCount } from '@/lib/session';
import Navbar from '@/components/Navbar';
import PrayerForm from '@/components/PrayerForm';
import CompanyAd from '@/components/CompanyAd';
import Link from 'next/link';

interface PrayerRequest {
  id: string;
  text?: string;
  name?: string;
  createdAt?: any;
  prayerCount?: number;
  status?: string;
  targetPrayerNum?: number;
  userId?: string;
  [key: string]: any;
}

export default function PrayPage() {
  const router = useRouter();
  const [prayerRequest, setPrayerRequest] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [noRequests, setNoRequests] = useState(false);
  const [sessionCount, setSessionCount] = useState<number>(0);

  useEffect(() => {
    async function fetchOldestActivePrayerRequest() {
      if (!db) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // Authenticate user first
        const user = await getAnonymousUser();

        // Get session count (like iOS app)
        const count = getSessionCount();
        setSessionCount(count);

        // Get all prayer requests this user has already prayed for
        const prayersRef = collection(db, 'prayers');
        const userPrayersQuery = query(
          prayersRef,
          where('userId', '==', user.uid)
        );
        const userPrayersSnapshot = await getDocs(userPrayersQuery);
        
        // Extract requestIds that user has already prayed for
        const prayedRequestIds = new Set<string>();
        userPrayersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.requestId) {
            prayedRequestIds.add(data.requestId);
          }
        });

        // Query for active prayer requests, ordered by createdAt
        const prayerRequestsRef = collection(db, 'prayerRequests');
        const q = query(
          prayerRequestsRef,
          where('status', '==', 'active'),
          orderBy('createdAt', 'asc')
        );

        const querySnapshot = await getDocs(q);

        // Find the oldest active prayer request that user hasn't prayed for
        let foundRequest: PrayerRequest | null = null;
        for (const doc of querySnapshot.docs) {
          if (!prayedRequestIds.has(doc.id)) {
            foundRequest = {
              id: doc.id,
              ...doc.data(),
            };
            break; // Found the oldest one they haven't prayed for
          }
        }

        if (foundRequest) {
          setPrayerRequest(foundRequest);
        } else {
          // No active prayer requests found that user hasn't prayed for
          setNoRequests(true);
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

    fetchOldestActivePrayerRequest();
  }, []);

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-2xl mx-auto w-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3D2817]">
              Error Loading Prayer Request
            </h1>
            <p className="text-[#3D2817] text-lg md:text-xl">
              There was an error loading the prayer request. Please try again.
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

  if (noRequests || !prayerRequest) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-2xl mx-auto w-full flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3D2817]">
              No Active Prayer Requests
            </h1>
            <p className="text-[#3D2817] text-lg md:text-xl">
              There are currently no active prayer requests. Check back soon!
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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-sm md:text-base font-medium text-[#3D2817]">
                Prayer Request
              </h1>
              <span className="text-sm md:text-base text-[#3D2817]">
                {sessionCount} {sessionCount === 1 ? 'prayer' : 'prayers'} this session
              </span>
            </div>
            
            <div className="prose prose-lg max-w-none">
              {prayerRequest.text && (
                <p className="text-[#3D2817] text-base md:text-lg leading-relaxed whitespace-pre-wrap font-bold">
                  {prayerRequest.text}
                </p>
              )}
              
              {prayerRequest.name && (
                <p className="text-[#3D2817] text-base md:text-lg leading-relaxed mt-4 font-medium">
                  {prayerRequest.name}
                </p>
              )}
            </div>
          </div>

          {/* Prayer Form */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
            <PrayerForm 
              requestId={prayerRequest.id} 
              onSuccess={() => {
                // Update session count display
                const newCount = getSessionCount();
                setSessionCount(newCount);
                // After successful prayer submission, reload the page to get the next oldest request
                window.location.reload();
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


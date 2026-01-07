'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAnonymousUser } from '@/lib/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import ShareRequestModal from '@/components/ShareRequestModal';
import Link from 'next/link';

interface UserData {
  prayersCompleted?: number;
  prayerRequestCredits?: number;
  [key: string]: any;
}

export default function RequestPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prayerText, setPrayerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [submittedPrayerText, setSubmittedPrayerText] = useState<string>('');

  useEffect(() => {
    async function fetchUserData() {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const user = await getAnonymousUser();
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          console.log('User data from Firestore:', data);
          setUserData(data);
        } else {
          // User doesn't exist yet, set defaults
          console.log('User document does not exist, using defaults');
          setUserData({
            prayersCompleted: 0,
            prayerRequestCredits: 0,
          });
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prayerText.trim()) {
      setError('Please enter your prayer request');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (!app) {
        throw new Error('Firebase app is not initialized');
      }

      const functions = getFunctions(app);
      const submitPrayerRequest = httpsCallable(functions, 'submitPrayerRequest');

      const result = await submitPrayerRequest({
        text: prayerText.trim(),
      });

      setSuccess(true);
      const submittedText = prayerText.trim();
      setPrayerText('');

      // Get the request ID from the result
      let requestId: string | null = null;
      if (result.data && typeof result.data === 'object' && 'requestId' in result.data) {
        requestId = result.data.requestId as string;
        setSubmittedRequestId(requestId);
        setSubmittedPrayerText(submittedText);
        // Show share modal
        setShowShareModal(true);
      } else {
        // If no request ID, redirect to pray page
        setTimeout(() => {
          router.push('/pray');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error submitting prayer request:', err);
      
      if (err?.code === 'unauthenticated') {
        setError('Please refresh the page and try again.');
      } else if (err?.code === 'permission-denied') {
        setError('Permission denied. Please refresh the page and try again.');
      } else if (err?.code === 'invalid-argument') {
        setError('Invalid input. Please check your prayer request and try again.');
      } else {
        setError(err?.message || 'Failed to submit prayer request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#3D2817] text-lg">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Get values from Firestore user document
  const prayersCompleted = userData?.prayersCompleted ?? 0;
  const prayerRequestCredits = userData?.prayerRequestCredits ?? 0;
  
  // User can submit if they have a prayer request credit
  // If they have 10+ prayers but no credit field, they should get one (handled by function)
  const canSubmitRequest = prayerRequestCredits > 0;
  
  // Debug log to verify data
  console.log('Request page - prayersCompleted:', prayersCompleted, 'prayerRequestCredits:', prayerRequestCredits, 'userData:', userData);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      
      <main className="flex-1 px-4 md:px-6 py-8 max-w-xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-6">
            Add a Prayer Request
          </h1>

          {!canSubmitRequest ? (
            <div className="space-y-6">
              <div className="bg-[#05ebfa]/20 border border-[#05ebfa] rounded-lg p-4">
                <p className="text-[#3D2817] text-base md:text-lg leading-relaxed">
                  To submit a prayer request, you need to either:
                </p>
                <ul className="list-disc list-inside mt-3 text-[#3D2817] space-y-2">
                  <li>Pray for at least <strong>10 people</strong> to earn a prayer request credit (you have prayed for {prayersCompleted})</li>
                  <li>You need a prayer request credit to submit (you currently have {prayerRequestCredits} credit{prayerRequestCredits !== 1 ? 's' : ''})</li>
                </ul>
              </div>

              <div className="text-center space-y-4">
                <p className="text-[#3D2817]">
                  Keep praying for others to earn the ability to submit your own prayer request!
                </p>
                <Link
                  href="/pray"
                  className="inline-block bg-[#3D2817] text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors"
                >
                  Start Praying
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Info */}
              <div className="bg-[#F5F5DC] rounded-lg p-4">
                <p className="text-[#3D2817] text-sm md:text-base">
                  You have <strong>{prayerRequestCredits} prayer request credit{prayerRequestCredits !== 1 ? 's' : ''}</strong> available.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="prayerRequest" className="block text-[#3D2817] font-medium mb-2">
                    Your Prayer Request *
                  </label>
                  <textarea
                    id="prayerRequest"
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    placeholder="Enter your prayer request here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05ebfa] focus:border-transparent resize-none text-[#3D2817] bg-white"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && !showShareModal && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    Your prayer request has been submitted!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !prayerText.trim()}
                  className="w-full bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {submittedRequestId && (
        <ShareRequestModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            // Redirect to the prayer request page after closing modal
            setTimeout(() => {
              router.push(`/${submittedRequestId}`);
            }, 300);
          }}
          requestId={submittedRequestId}
          prayerText={submittedPrayerText}
        />
      )}
    </div>
  );
}


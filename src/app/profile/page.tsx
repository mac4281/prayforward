'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Receipt {
  id: string;
  amount: number;
  type: 'one-time' | 'subscription';
  date: Date;
  stripeSessionId?: string;
  status?: string;
  invoiceId?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    personalRatio?: number;
    prayerRequestCredits?: number;
    prayersCompleted?: number;
    requestsSubmitted?: number;
  } | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in (either anonymous or with email)
        setUser(firebaseUser);
        
        // Fetch user stats from Firestore (for both anonymous and authenticated users)
        if (db) {
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserStats({
                personalRatio: data.personalRatio ?? 0,
                prayerRequestCredits: data.prayerRequestCredits ?? 0,
                prayersCompleted: data.prayersCompleted ?? 0,
                requestsSubmitted: data.requestsSubmitted ?? 0,
              });
            } else {
              // User document doesn't exist yet, set defaults
              setUserStats({
                personalRatio: 0,
                prayerRequestCredits: 0,
                prayersCompleted: 0,
                requestsSubmitted: 0,
              });
            }
          } catch (error) {
            console.error('Error fetching user stats:', error);
          }
        }
        
        // Only fetch receipts if user has email (non-anonymous)
        if (firebaseUser.email) {
          setLoadingReceipts(true);
          try {
            const response = await fetch('/api/get-receipts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: firebaseUser.uid,
                userEmail: firebaseUser.email,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              // Convert date strings to Date objects and filter out "succeeded" status
              const receiptsWithDates = (data.receipts || [])
                .filter((receipt: any) => receipt.status !== 'succeeded')
                .map((receipt: any) => ({
                  ...receipt,
                  date: receipt.date ? new Date(receipt.date) : new Date(),
                }));
              setReceipts(receiptsWithDates);
            } else {
              console.error('Error fetching receipts:', await response.text());
            }
          } catch (error) {
            console.error('Error fetching receipts:', error);
          } finally {
            setLoadingReceipts(false);
          }
        } else {
          // Anonymous user - no receipts
          setReceipts([]);
          setLoadingReceipts(false);
        }
      } else {
        // No user - sign in anonymously
        if (auth) {
          try {
            await signInAnonymously(auth);
            // The auth state change will fire again with the anonymous user
          } catch (error) {
            console.error('Error signing in anonymously:', error);
            setUser(null);
            setReceipts([]);
            setUserStats(null);
          }
        } else {
          setUser(null);
          setReceipts([]);
          setUserStats(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!auth) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const handleDownloadReceipt = async (receipt: Receipt) => {
    setDownloadingReceipt(receipt.id);
    try {
      const response = await fetch('/api/get-receipt-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: receipt.id,
          receiptType: receipt.type,
          invoiceId: receipt.invoiceId,
        }),
      });

      const data = await response.json();

      if (data.pdfUrl) {
        // Open PDF in new tab
        window.open(data.pdfUrl, '_blank');
      } else {
        alert('Receipt PDF not available. Please contact support.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#3D2817] text-lg">Loading...</p>
          </div>
        </main>
      </div>
    );
  }


  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
        <Navbar />
        <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#3D2817] text-lg">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-2">
                Account
              </h1>
              {user.email ? (
                <>
                  <p className="text-[#3D2817]">{user.email}</p>
                  {user.displayName && (
                    <p className="text-[#3D2817] font-medium">{user.displayName}</p>
                  )}
                </>
              ) : (
                <p className="text-[#3D2817]">Anonymous Account</p>
              )}
            </div>
            {user.email && (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="bg-[#3D2817] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a1c10] transition-colors disabled:opacity-50"
              >
                {signingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            )}
          </div>

          {/* Login/Register for Anonymous Users */}
          {!user.email && (
            <div className="mb-6 p-4 bg-[#40E0D0]/10 rounded-lg border border-[#40E0D0]/20">
              <p className="text-[#3D2817] mb-4">
                Link your account to an email and password to keep your data safe and access your receipts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 bg-[#40E0D0] text-[#3D2817] px-6 py-3 rounded-lg font-semibold hover:bg-[#30c0b0] transition-colors text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 bg-[#3D2817] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2a1c10] transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* User Stats */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#3D2817]/10">
              <div>
                <p className="text-sm text-[#3D2817]/70 mb-1">Prayers Completed</p>
                <p className="text-2xl font-bold text-[#3D2817]">
                  {userStats.prayersCompleted ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#3D2817]/70 mb-1">Requests Submitted</p>
                <p className="text-2xl font-bold text-[#3D2817]">
                  {userStats.requestsSubmitted ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#3D2817]/70 mb-1">Personal Ratio</p>
                <p className="text-2xl font-bold text-[#3D2817]">
                  {(userStats.personalRatio ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#3D2817]/70 mb-1">Prayer Request Credits</p>
                <p className="text-2xl font-bold text-[#3D2817]">
                  {userStats.prayerRequestCredits ?? 0}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Purchase Receipts - Only show for authenticated (non-anonymous) users */}
        {user.email && (
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3D2817] mb-6">
              Purchase Receipts
            </h2>

          {loadingReceipts ? (
            <div className="text-center py-12">
              <p className="text-[#3D2817] text-lg">Loading receipts...</p>
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#3D2817] text-lg mb-4">No receipts found</p>
              <p className="text-[#3D2817]/70 text-sm mb-6">
                Your donation and subscription receipts will appear here.
              </p>
              <Link
                href="/support"
                className="inline-block bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors"
              >
                Make a Donation
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="border border-[#3D2817]/20 rounded-lg p-4 hover:bg-[#F5F5DC] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#3D2817]">
                          {receipt.type === 'subscription' ? 'Monthly Support' : 'One-Time Donation'}
                        </h3>
                        {receipt.status && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            receipt.status === 'paid' || receipt.status === 'complete'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {receipt.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[#3D2817]/70 text-sm">
                        {formatDate(receipt.date)}
                      </p>
                      {receipt.stripeSessionId && (
                        <p className="text-[#3D2817]/50 text-xs mt-1">
                          Session: {receipt.stripeSessionId.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#3D2817]">
                        {formatAmount(receipt.amount)}
                      </p>
                      {receipt.type === 'subscription' && (
                        <p className="text-sm text-[#3D2817]/70">per month</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#3D2817]/10">
                    <button
                      onClick={() => handleDownloadReceipt(receipt)}
                      disabled={downloadingReceipt === receipt.id}
                      className="flex items-center gap-2 text-[#3D2817] hover:text-[#40E0D0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingReceipt === receipt.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm font-medium">Loading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm font-medium">Download Receipt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </main>
    </div>
  );
}


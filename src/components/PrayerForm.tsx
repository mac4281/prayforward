'use client';

import { useState } from 'react';
import { getAnonymousUser } from '@/lib/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { incrementSessionCount, shouldGrantCredit } from '@/lib/session';

interface PrayerFormProps {
  requestId: string;
  onSuccess?: () => void;
}

export default function PrayerForm({ requestId, onSuccess }: PrayerFormProps) {
  const [prayerText, setPrayerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prayerText.trim()) {
      setError('Please enter a prayer');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Get anonymous user
      const user = await getAnonymousUser();
      
      // Call Firebase Function to submit prayer
      if (!app) {
        throw new Error('Firebase app is not initialized');
      }

      const functions = getFunctions(app);
      const prayForRequest = httpsCallable(functions, 'prayForRequest');

      const result = await prayForRequest({
        requestId: requestId,
        prayerText: prayerText.trim(),
      });

      // Increment session count (like iOS app)
      const newSessionCount = incrementSessionCount();
      
      // Grant prayer request credit every 10 prayers in session (10, 20, 30, etc.)
      if (shouldGrantCredit(newSessionCount)) {
        console.log(`🎉 User reached ${newSessionCount} prayers in session! Granting prayer request credit...`);
        
        try {
          if (db) {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              // Increment prayerRequestCredits
              await updateDoc(userRef, {
                prayerRequestCredits: increment(1),
              });
              console.log(`✅ Prayer request credit granted. New session count: ${newSessionCount}`);
            } else {
              // User doesn't exist yet, create with credit
              await setDoc(userRef, {
                prayerRequestCredits: 1,
              }, { merge: true });
              console.log(`✅ Prayer request credit granted (new user). New session count: ${newSessionCount}`);
            }
          }
        } catch (creditError) {
          console.error('Error granting prayer request credit:', creditError);
          // Don't fail the prayer submission if credit granting fails
        }
      }

      setSuccess(true);
      setPrayerText('');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error submitting prayer:', err);
      
      // Handle Firebase Functions errors
      if (err?.code === 'unauthenticated') {
        setError('Please refresh the page and try again.');
      } else if (err?.code === 'permission-denied') {
        setError('Permission denied. Please refresh the page and try again.');
      } else if (err?.code === 'not-found') {
        setError('Prayer request not found.');
      } else if (err?.code === 'invalid-argument') {
        setError('Invalid input. Please check your prayer and try again.');
      } else {
        setError(err?.message || 'Failed to submit prayer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prayer" className="block text-[#3D2817] font-medium mb-2">
          Add Your Prayer
        </label>
        <textarea
          id="prayer"
          value={prayerText}
          onChange={(e) => setPrayerText(e.target.value)}
          placeholder="Enter your prayer here..."
          rows={6}
          className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent resize-none text-[#3D2817] bg-white"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Thank you for your prayer! It has been submitted.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !prayerText.trim()}
        className="w-full bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Prayer'}
      </button>
    </form>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, linkWithCredential, EmailAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAnonymous(user !== null && !user.email);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (!auth || !db) {
        throw new Error('Firebase is not initialized');
      }

      let user;
      
      // If user is anonymous, link the email/password credential to preserve UID and data
      if (isAnonymous && auth.currentUser) {
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(auth.currentUser, credential);
        user = userCredential.user;
        
        // Update display name
        if (name) {
          await updateProfile(user, { displayName: name });
        }
        
        // Update user document in Firestore (preserve existing data, just add email and name)
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // Update existing document
            const existingData = userDoc.data();
            await setDoc(userRef, {
              ...existingData,
              email: user.email,
              name: name || user.displayName || existingData.name || '',
              isAnonymous: false,
              updatedAt: serverTimestamp(),
            }, { merge: true });
          } else {
            // Create new document (shouldn't happen but just in case)
            await setDoc(userRef, {
              email: user.email,
              name: name || user.displayName || '',
              prayersCompleted: 0,
              requestsSubmitted: 0,
              personalRatio: 0,
              prayerRequestCredits: 0,
              isAnonymous: false,
              createdAt: serverTimestamp(),
            });
          }
        } catch (firestoreError: any) {
          console.error('Error updating user document:', firestoreError);
          // Don't throw - the account is still linked, just the document update failed
        }
      } else {
        // Create new user account (not anonymous)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Update display name
        if (name) {
          await updateProfile(user, { displayName: name });
        }

        // Wait a moment for auth state to propagate and verify user is authenticated
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify user is still authenticated
        if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
          throw new Error('Authentication state lost. Please try again.');
        }

        // Create user document in Firestore
        try {
          const userData = {
            email: user.email,
            name: name || user.displayName || '',
            prayersCompleted: 0,
            requestsSubmitted: 0,
            personalRatio: 0,
            prayerRequestCredits: 0,
            isAnonymous: false,
            createdAt: serverTimestamp(),
          };
          
          await setDoc(doc(db, 'users', user.uid), userData);
        } catch (firestoreError: any) {
          console.error('Error creating user document:', firestoreError);
          throw new Error(`Failed to create user profile: ${firestoreError.message || firestoreError.code || 'Unknown error'}`);
        }
      }

      router.push('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 py-8 max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-[#3D2817]/10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D2817] mb-6 text-center">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-[#3D2817] font-medium mb-2">
                Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[#3D2817] font-medium mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#3D2817] font-medium mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[#3D2817] font-medium mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-[#3D2817]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent text-[#3D2817] bg-white"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3D2817] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#2a1c10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#3D2817] text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#40E0D0] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


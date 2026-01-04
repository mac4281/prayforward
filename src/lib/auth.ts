import { signInAnonymously, User } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign in anonymously and return the user
 * If already signed in, returns the current user
 */
export async function getAnonymousUser(): Promise<User> {
  if (!auth) {
    throw new Error('Firebase auth is not initialized');
  }

  // If user is already signed in, return current user
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // Otherwise, sign in anonymously
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in anonymously:', error);
    throw new Error(`Failed to authenticate: ${error.message || 'Unknown error'}`);
  }
}


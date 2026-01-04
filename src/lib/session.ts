/**
 * Session management for tracking prayers in a session
 * Similar to iOS app's sessionPrayerCount
 */

const SESSION_COUNT_KEY = 'prayitforward_session_count';
const SESSION_START_KEY = 'prayitforward_session_start';

/**
 * Get the current session prayer count
 */
export function getSessionCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(SESSION_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment the session prayer count
 * Returns the new count
 */
export function incrementSessionCount(): number {
  if (typeof window === 'undefined') return 0;
  const currentCount = getSessionCount();
  const newCount = currentCount + 1;
  localStorage.setItem(SESSION_COUNT_KEY, newCount.toString());
  localStorage.setItem(SESSION_START_KEY, Date.now().toString());
  return newCount;
}

/**
 * Reset the session count (when starting a new session)
 */
export function resetSessionCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_COUNT_KEY);
  localStorage.removeItem(SESSION_START_KEY);
}

/**
 * Check if we should grant a credit (every 10 prayers: 10, 20, 30, etc.)
 */
export function shouldGrantCredit(sessionCount: number): boolean {
  return sessionCount > 0 && sessionCount % 10 === 0;
}


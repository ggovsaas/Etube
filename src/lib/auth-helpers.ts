/**
 * Auth.js helper functions for client-side authentication
 */

import { signOut as nextAuthSignOut } from 'next-auth/react';

/**
 * Sign out the user and redirect
 * @param callbackUrl - Optional URL to redirect to after sign out
 */
export async function signOut(callbackUrl?: string) {
  try {
    await nextAuthSignOut({ 
      callbackUrl: callbackUrl || '/',
      redirect: true 
    });
  } catch (error) {
    console.error('Sign out error:', error);
    // Fallback: redirect manually if signOut fails
    if (typeof window !== 'undefined') {
      window.location.href = callbackUrl || '/';
    }
  }
}

/**
 * Get the current session (client-side)
 * Use this in client components
 */
export async function getSession() {
  const { getSession: nextAuthGetSession } = await import('next-auth/react');
  return nextAuthGetSession();
}


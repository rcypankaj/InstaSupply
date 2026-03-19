import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
} from '@react-native-firebase/auth';
import { auth } from '../services/firebase';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthHook {
  loading: boolean;
  error: string | null;
  confirmationResult: FirebaseAuthTypes.ConfirmationResult | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  sendPhoneOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const clearError = () => setError(null);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOTP = async (phoneNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber);
      setConfirmationResult(result);
    } catch (err: any) {
      console.log(err, 'kfn');
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (code: string) => {
    if (!confirmationResult) {
      setError('No OTP was sent. Please request a new one.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(code);
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { loading, error, confirmationResult, loginWithEmail, sendPhoneOTP, verifyOTP, logout, clearError };
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP code. Please try again.';
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Include country code (e.g. +1).';
    case 'auth/session-expired':
      return 'OTP expired. Please request a new one.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

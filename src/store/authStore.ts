import { create } from 'zustand';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type AuthStep = 'unauthenticated' | 'phone_required' | 'authenticated';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  authStep: AuthStep;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setAuthStep: (step: AuthStep) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authStep: 'unauthenticated',
  setUser: (user) => set({ user }),
  setAuthStep: (authStep) => set({ authStep }),
}));

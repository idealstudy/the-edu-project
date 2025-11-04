import type { Member } from '@/features/member/model/types';
import { create } from 'zustand';

interface AuthState {
  user: Member | null;
  setUser: (user: Member | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

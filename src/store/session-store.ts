import type { Member } from '@/features/member/model/types';
import { create } from 'zustand';

interface SessionState {
  user: Member | null;
  setUser: (user: Member | null) => void;
  clearUser: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

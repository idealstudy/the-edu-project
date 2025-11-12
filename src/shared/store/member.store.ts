import { Member } from '@/entities/member';
import { create } from 'zustand';

interface MemberState {
  member: Member | null;
  isAuthenticated: boolean;
  setMember: (member: Member | null) => void;
  clearMember: () => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  member: null,
  isAuthenticated: false,
  setMember: (member) => set({ member }),
  clearMember: () => set({ member: null }),
}));

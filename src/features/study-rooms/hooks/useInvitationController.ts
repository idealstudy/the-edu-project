import { useEffect, useState } from 'react';

import { useSearchInvitation } from '@/features/study-rooms';

export type Invitee = {
  role: string;
  canInvite: boolean;
  inviteeId: number;
  inviteeEmail: string;
  inviteeName: string;
  connectedGuardianCount: number;
  connectedStudentCount: number;
  studentResponseList: string[] | null;
};

export type InvitationController = {
  // state
  isSearch: boolean;
  searchQuery: string;
  searchResult: Invitee | null;
  invitees: Map<string, Invitee>;
  // intent-level
  openSearch: () => void;
  closeSearch: () => void;
  toggle: () => void;

  setSearchQuery: (query: string) => void;
  search: (query?: string) => Promise<void> | void;
  addUser: () => void;
  removeUser: (email: string) => void;
  removeLast: () => void;
};

export const useInvitationController = (
  studyRoomId: number
): InvitationController => {
  // TODO: 추후 리듀서로 리팩토링 예정
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<null | Invitee>(null);
  const [invitees, setInvitees] = useState<Map<string, Invitee>>(new Map());

  const { refetch, data } = useSearchInvitation({
    studyRoomId,
    keyword: searchQuery,
  });

  useEffect(() => {
    if (data) {
      setSearchResult(data);
    }
  }, [data]);

  const openSearch = () => setIsSearch(true);
  const closeSearch = () => setIsSearch(false);
  const toggle = () => setIsSearch((prev: boolean) => !prev);

  const search = async () => {
    if (!searchQuery.trim()) return;
    await refetch();
  };

  const addUser = () => {
    if (!searchResult) return;
    setInvitees((prev) => {
      const next = new Map(prev);
      return next.set(searchResult.inviteeEmail, searchResult);
    });

    closeSearch();
  };

  const removeUser = (email: string) => {
    setInvitees((prev) => {
      const next = new Map(prev);
      next.delete(email);
      return next;
    });
  };

  const removeLast = () => {
    setInvitees((prev) => {
      if (prev.size === 0) return prev;
      const next = new Map(prev);
      const last = Array.from(next.keys()).pop()!;
      next.delete(last);
      return next;
    });
  };

  return {
    isSearch,
    searchQuery,
    searchResult,
    invitees,
    openSearch,
    closeSearch,
    toggle,
    setSearchQuery,
    search,
    addUser,
    removeUser,
    removeLast,
  };
};

import React, { useState } from 'react';

export type Invitee = {
  email: string;
  name: string;
  role: string;
  guardian: string;
  status: 'invite' | 'already';
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

  change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: (query?: string) => Promise<void> | void;
  addUser: () => void;
  removeUser: () => void;
  submit: () => void;
};

export const useInvitationController = (): InvitationController => {
  const [isSearch, setIsSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('student@dedu.com');
  const [searchResult, setSearchResult] = useState<null | Invitee>(null);
  const [invitees, setInvitees] = useState<Map<string, Invitee>>(new Map());

  const openSearch = () => setIsSearch(true);
  const closeSearch = () => setIsSearch(false);
  const toggle = () => setIsSearch((prev: boolean) => !prev);

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const search = (query?: string) => {
    setSearchResult({
      email: query ?? 'unknown@dedu.com',
      name: '김은지',
      role: '학생',
      guardian: '보호자 1',
      status: 'invite',
    });
  };

  const addUser = () => {
    if (!searchResult) return alert('사용자가 없어용');
    setInvitees((prev) => {
      const next = new Map(prev);
      return next.set(searchResult.email, searchResult);
    });

    closeSearch();
  };

  const removeUser = () => {
    alert('사용자 제거');
  };

  const submit = () => alert('초대하기 버튼 클릭');

  return {
    isSearch,
    searchQuery,
    searchResult,
    invitees,
    openSearch,
    closeSearch,
    toggle,
    change,
    search,
    submit,
    addUser,
    removeUser,
  };
};

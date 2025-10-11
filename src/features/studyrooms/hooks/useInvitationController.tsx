import React, { useState } from 'react';

export type InvitationSearchResultType = {
  name: string;
  role: string;
  guardian: string;
  status: 'invite' | 'already';
};

export type InvitationController = {
  isSearch: boolean;
  searchQuery: string;
  searchResult: InvitationSearchResultType | null;
  toggle: () => void;
  change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  keyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  submit: () => void;
};

export const useInvitationController = (): InvitationController => {
  const [isSearch, setIsSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('student@dedu.com');
  const [searchResult, setSearchResult] = useState<null | {
    name: string;
    role: string;
    guardian: string;
    status: 'invite' | 'already';
  }>(null);

  const toggle = () => setIsSearch((prev: boolean) => !prev);

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);

  const keyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key === 'Enter' &&
    setSearchResult({
      name: '김은지',
      role: '학생',
      guardian: '보호자 1',
      status: 'invite',
    });

  const submit = () => alert('초대하기 버튼 클릭');

  return {
    toggle,
    isSearch,
    change,
    searchQuery,
    keyDown,
    searchResult,
    submit,
  };
};

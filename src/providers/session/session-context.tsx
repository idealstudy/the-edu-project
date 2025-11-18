'use client';

import { createContext, useContext } from 'react';

import { MemberDTO } from '@/entities/member';

export type SessionStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface SessionSnapshot {
  status: SessionStatus;
  member: MemberDTO | null;
  error: unknown;
}

export interface SessionContextValue extends SessionSnapshot {
  refresh: () => Promise<MemberDTO | null>;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export const SessionProviderContext = SessionContext;

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error(
      'SessionProvider가 존재하지 않는 곳에서 세션을 사용하려고 했습니다.'
    );
  return context;
};

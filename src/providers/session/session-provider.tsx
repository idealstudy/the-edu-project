'use client';

import { type ReactNode, useMemo } from 'react';

import { useCurrentMember } from '@/providers/session/hooks/use-current-member';

import {
  SessionContextValue,
  SessionProviderContext,
  SessionStatus,
} from './session-context';

interface SessionProviderProps {
  children: ReactNode;
  initialHasSession: boolean;
}

export const SessionProvider = ({
  children,
  initialHasSession,
}: SessionProviderProps) => {
  const {
    data: member,
    isPending,
    isError,
    refetch,
  } = useCurrentMember(initialHasSession);

  // 쿼리상태 변환
  const status: SessionStatus = useMemo(() => {
    if (!initialHasSession && !member) return 'unauthenticated';
    if (isPending) return 'loading';
    if (isError) return 'error';
    if (member) return 'authenticated';
    return 'unauthenticated';
  }, [initialHasSession, isPending, isError, member]);

  // Context Value
  const value: SessionContextValue = useMemo(
    () => ({
      status: status,
      member: member || null,
      error: isError ? 'SESSION_ERROR' : null,
      refresh: async () => {
        const result = await refetch();
        return result.data || null;
      },
    }),
    [status, member, isError, refetch]
  );

  return (
    <SessionProviderContext.Provider value={value}>
      {children}
    </SessionProviderContext.Provider>
  );
};

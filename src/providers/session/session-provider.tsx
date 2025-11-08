'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Member } from '@/features/member/model/types';
import { QuerySessionStrategy } from '@/providers/session/session-query.strategy';
import type { SessionStrategy } from '@/providers/session/session-strategy';
import { useAuthStore } from '@/store/session-store';
import { useQueryClient } from '@tanstack/react-query';

import {
  SessionProviderContext,
  type SessionSnapshot,
} from './session-context';

interface SessionProviderProps {
  children: ReactNode;
  strategy?: SessionStrategy;
}

const INITIAL_STATE: SessionSnapshot = {
  status: 'loading',
  member: null,
  error: null,
};

export const SessionProvider = ({
  children,
  strategy,
}: SessionProviderProps) => {
  const queryClient = useQueryClient();
  const defaultStrategy = useMemo(
    () => strategy ?? new QuerySessionStrategy(queryClient),
    [strategy, queryClient]
  );
  const { setUser, clearUser } = useAuthStore();
  const [snapshot, setSnapshot] = useState<SessionSnapshot>(INITIAL_STATE);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const applyAuthenticated = useCallback(
    (member: Member) => {
      if (isMountedRef.current) {
        setSnapshot({ status: 'authenticated', member, error: null });
      }
      setUser(member);
      return member;
    },
    [setUser]
  );

  const applyUnauthenticated = useCallback(() => {
    if (isMountedRef.current) {
      setSnapshot({ status: 'unauthenticated', member: null, error: null });
    }
    clearUser();
    return null;
  }, [clearUser]);

  const applyError = useCallback(
    (error: unknown) => {
      if (isMountedRef.current) {
        setSnapshot({ status: 'error', member: null, error });
      }
      clearUser();
    },
    [clearUser]
  );

  const refresh = useCallback(async () => {
    if (isMountedRef.current) {
      setSnapshot((prev) => ({ ...prev, status: 'loading', error: null }));
    }

    try {
      const member = await defaultStrategy.bootstrap();
      if (member) return applyAuthenticated(member);
      return applyUnauthenticated();
    } catch (error) {
      applyError(error);
      throw error;
    }
  }, [defaultStrategy, applyAuthenticated, applyUnauthenticated, applyError]);

  // 마운트시 refresh 때림
  // TODO: 나중에 시드 추출해서 프롭으로 내린담에 그거 존재여부에따라서 리프레시 호출로 변경해야함
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      ...snapshot,
      refresh,
    }),
    [snapshot, refresh]
  );

  return (
    <SessionProviderContext.Provider value={value}>
      {children}
    </SessionProviderContext.Provider>
  );
};

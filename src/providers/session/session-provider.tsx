'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Member } from '@/entities';
import { makeQuerySessionStrategy } from '@/providers/session/session-strategy';
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
  initialHasSession: boolean;
}

export const SessionProvider = ({
  children,
  strategy,
  initialHasSession,
}: SessionProviderProps) => {
  const queryClient = useQueryClient();
  const defaultStrategy = useMemo(
    () => strategy ?? makeQuerySessionStrategy(queryClient),
    [strategy, queryClient]
  );
  const { setUser, clearUser } = useAuthStore();
  /**
   * 쿠키 있으면 서버확인 필요
   * 쿠키 없으면 바로 비로그인
   */
  const [snapshot, setSnapshot] = useState<SessionSnapshot>(() =>
    initialHasSession
      ? { status: 'loading', member: null, error: null }
      : { status: 'unauthenticated', member: null, error: null }
  );
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
      return null;
    }
  }, [defaultStrategy, applyAuthenticated, applyUnauthenticated, applyError]);

  useEffect(() => {
    const bootstrap = async () => {
      // 쿠키 있으면 서버에서 확정
      if (initialHasSession) await refresh();
      // 쿠키 없으면 요청 자체 스킵
      else applyUnauthenticated();
    };
    void bootstrap();
  }, [initialHasSession, refresh, applyUnauthenticated]);

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

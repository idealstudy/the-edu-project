'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import { FullScreenLoader } from '@/shared/components/loading';
import { useSession } from '@/shared/providers';

export const SessionGuardFallback = () => {
  const { status } = useSession();
  const pathname = usePathname();

  const isLoginRoute = pathname?.startsWith('/login');
  const isRegisterRoute = pathname?.startsWith('/register');
  const isAuthRoute = isLoginRoute || isRegisterRoute;

  const title =
    isAuthRoute && status === 'loading'
      ? '로그인 중입니다'
      : '디에듀를 불러오는 중...';
  return <FullScreenLoader title={title} />;
};

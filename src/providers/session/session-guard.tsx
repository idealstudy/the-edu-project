'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTE } from '@/constants/route';
import { useSession } from '@/providers';

interface SessionGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

const DEFAULT_FALLBACK = (
  <div className="flex h-screen items-center justify-center text-white">
    세션을 불러오는 중입니다...
  </div>
);

export const SessionGuard = ({
  children,
  redirectTo = ROUTE.LOGIN,
  fallback = DEFAULT_FALLBACK,
}: SessionGuardProps) => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(redirectTo);
    }
  }, [status, router, redirectTo]);

  if (status === 'authenticated') return <>{children}</>;
  if (status === 'loading') return <>{fallback}</>;
  if (status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-white">
        <p className="mb-2 text-lg font-semibold">
          세션 정보를 불러오는 데 실패했습니다.
        </p>
        <p className="text-sm text-gray-200">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return <>{fallback}</>;
};

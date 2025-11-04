'use client';

import { ReactNode, useEffect } from 'react';

import { useMemberInfo } from '@/features/member/hooks/use-queries';
import { useAuthStore } from '@/store/session-store';

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { data: member, isLoading } = useMemberInfo();
  const { setUser, clearUser } = useAuthStore();

  useEffect(() => {
    if (member) setUser(member);
    else clearUser();
  }, [member, setUser, clearUser]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-white">
        세션을 불러오는 중입니다...
      </div>
    );

  if (!member) {
    window.location.replace('/login');
    return null;
  }

  return <>{children}</>;
};

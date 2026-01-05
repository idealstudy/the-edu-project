'use client';

import { useEffect, useState } from 'react';

import { trackPageView } from '@/shared/lib/gtm/trackers';
import { useMemberStore } from '@/store';

type Props = {
  pageName: string;
};

export default function PageViewTracker({ pageName }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const session = useMemberStore((s) => s.member);

  // 클라이언트에서만 마운트 확인 (hydration 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 마운트된 후에만 추적 (hydration 완료 후)
    if (isMounted) {
      trackPageView(pageName, {}, session?.role ?? null);
    }
  }, [pageName, session?.role, isMounted]);

  return null; // UI 렌더링 없음
}

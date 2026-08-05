'use client';

import { useEffect, useState } from 'react';

import { useExitImpersonation } from '../hooks/use-impersonation';
import {
  IMPERSONATION_STORAGE_KEY,
  type ImpersonationMarker,
} from '../model/storage';

export const ImpersonationBanner = () => {
  const [marker, setMarker] = useState<ImpersonationMarker | null>(null);
  const exitMutation = useExitImpersonation();

  useEffect(() => {
    const raw = window.sessionStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (!raw) return;
    try {
      setMarker(JSON.parse(raw) as ImpersonationMarker);
    } catch {
      window.sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    }
  }, []);

  if (!marker) return null;

  return (
    <div
      className="sticky top-0 z-50 flex min-h-12 flex-wrap items-center justify-center gap-3 bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
      data-testid="impersonation-banner"
    >
      <span>{marker.name}님의 화면을 보고 있습니다.</span>
      <button
        type="button"
        className="rounded-md bg-white px-3 py-1.5 text-orange-700 disabled:opacity-60"
        disabled={exitMutation.isPending}
        onClick={() => exitMutation.mutate()}
      >
        {exitMutation.isPending ? '돌아가는 중' : '관리자로 돌아가기'}
      </button>
    </div>
  );
};

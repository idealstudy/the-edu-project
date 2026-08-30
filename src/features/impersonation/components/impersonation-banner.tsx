'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui';

import {
  clearExpiredImpersonationSession,
  useExitImpersonation,
} from '../hooks/use-impersonation';

export const ImpersonationBanner = ({
  active,
  memberName,
  expiresAt,
}: {
  active: boolean;
  memberName: string;
  expiresAt: number;
}) => {
  const exitMutation = useExitImpersonation();
  const [expiryHandled, setExpiryHandled] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    if (!active) return;
    const update = () =>
      setRemainingSeconds(
        Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [active, expiresAt]);

  useEffect(() => {
    if (!active || remainingSeconds > 0 || expiryHandled) return;
    setExpiryHandled(true);
    clearExpiredImpersonationSession();
  }, [active, expiryHandled, remainingSeconds]);

  if (!active || remainingSeconds <= 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div
      className="sticky top-0 z-50 flex min-h-12 flex-wrap items-center justify-center gap-3 bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
      data-testid="impersonation-banner"
    >
      <span>
        {memberName}님의 화면을 보고 있습니다. 최대 30분 · 남은 시간 {minutes}:
        {String(seconds).padStart(2, '0')}
      </span>
      <Button
        type="button"
        size="small"
        variant="secondary"
        disabled={exitMutation.isPending}
        onClick={() => exitMutation.mutate()}
      >
        {exitMutation.isPending ? '돌아가는 중' : '관리자로 돌아가기'}
      </Button>
    </div>
  );
};

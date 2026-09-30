'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { APP_VERSION_IDENTITY } from '@/shared/lib/app-version';
import {
  RELOAD_MARK_KEY,
  shouldReloadForVersion,
  toIdentity,
} from '@/shared/lib/stale-version';

const MIN_CHECK_INTERVAL_MS = 30_000;
const POLL_INTERVAL_MS = 5 * 60_000;

/**
 * 새 배포가 나오면 떠 있던 화면을 한 번 새로고침한다.
 * 확인 시점: 앱이 다시 앞으로 올 때, 화면을 옮길 때(30초 간격 제한), 5분마다.
 */
export function StaleVersionReload() {
  const pathname = usePathname();
  const lastCheckRef = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const check = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastCheckRef.current < MIN_CHECK_INTERVAL_MS) return;
      lastCheckRef.current = now;
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        if (!res.ok) return;
        const server = await res.json();
        let mark: string | null = null;
        try {
          mark = sessionStorage.getItem(RELOAD_MARK_KEY);
        } catch {}
        if (!shouldReloadForVersion(APP_VERSION_IDENTITY, server, mark)) return;
        try {
          sessionStorage.setItem(RELOAD_MARK_KEY, toIdentity(server) ?? '');
        } catch {}
        window.location.reload();
      } catch {
        // 오프라인·네트워크 실패는 무시한다.
      }
    };

    void check();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void check(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);
    const timer = window.setInterval(() => void check(true), POLL_INTERVAL_MS);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
      window.clearInterval(timer);
    };
  }, [pathname]);

  return null;
}

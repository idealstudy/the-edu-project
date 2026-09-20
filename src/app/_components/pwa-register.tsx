'use client';

import { useEffect } from 'react';

/**
 * PWA 서비스워커 등록. production 빌드에서만 동작하며 실패는 조용히 무시한다.
 * 개발 모드에서는 등록하지 않는다(HMR·캐시 간섭 방지).
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 등록 실패는 화면에 노출하지 않는다.
    });
  }, []);

  return null;
}

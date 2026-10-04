'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui';

export const DESKTOP_SITE_NOTICE_DISMISSED_KEY =
  'd-edu:desktop-site-notice-dismissed';

export type DesktopSiteSignals = {
  maxTouchPoints: number;
  coarsePointer: boolean;
  screenWidth: number;
  screenHeight: number;
  innerWidth: number;
};

export function shouldShowDesktopSiteNotice({
  maxTouchPoints,
  coarsePointer,
  screenWidth,
  screenHeight,
  innerWidth,
}: DesktopSiteSignals) {
  const shortScreenSide = Math.min(screenWidth, screenHeight);
  const hasTouchInput = maxTouchPoints > 0 || coarsePointer;

  return (
    hasTouchInput &&
    shortScreenSide > 0 &&
    shortScreenSide < 768 &&
    innerWidth >= 900
  );
}

export function DesktopSiteNoticeView({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <section
      aria-label="화면 표시 안내"
      className="bg-orange-12 shadow-popover min-h-desktop-site-notice fixed inset-x-0 top-0 z-(--z-layer-notification) text-white"
      data-testid="desktop-site-notice"
    >
      <div className="min-h-desktop-site-notice max-w-shell gap-section-gap px-appbar-pad-x py-section-gap-mobile mx-auto flex w-full items-center">
        <p
          aria-live="polite"
          className="font-desktop-site-notice min-w-0 flex-1 text-center break-keep"
        >
          PC 화면으로 보이고 있어요. 크롬 메뉴(⋮)에서 &apos;데스크톱
          사이트&apos; 체크를 꺼 주세요.
        </p>
        <Button
          aria-label="화면 표시 안내 닫기"
          className="font-desktop-site-notice min-h-desktop-site-notice-target min-w-desktop-site-notice-target rounded-button hover:bg-orange-11 active:bg-orange-10 shrink-0 border border-white text-white"
          data-testid="desktop-site-notice-dismiss"
          onClick={onDismiss}
          size="none"
          variant="unstyled"
        >
          닫기
        </Button>
      </div>
    </section>
  );
}

export function DesktopSiteNotice() {
  const [visible, setVisible] = useState(false);
  const dismissedInMemoryRef = useRef(false);

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');

    const syncVisibility = () => {
      if (dismissedInMemoryRef.current) {
        setVisible(false);
        return;
      }

      try {
        if (sessionStorage.getItem(DESKTOP_SITE_NOTICE_DISMISSED_KEY) === '1') {
          setVisible(false);
          return;
        }
      } catch {
        // 저장소 접근이 차단돼도 안내 감지는 계속한다.
      }

      setVisible(
        shouldShowDesktopSiteNotice({
          maxTouchPoints: navigator.maxTouchPoints ?? 0,
          coarsePointer: coarsePointerQuery.matches,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          innerWidth: window.innerWidth,
        })
      );
    };

    syncVisibility();
    window.addEventListener('resize', syncVisibility);
    window.addEventListener('orientationchange', syncVisibility);
    coarsePointerQuery.addEventListener('change', syncVisibility);

    return () => {
      window.removeEventListener('resize', syncVisibility);
      window.removeEventListener('orientationchange', syncVisibility);
      coarsePointerQuery.removeEventListener('change', syncVisibility);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    dismissedInMemoryRef.current = true;
    setVisible(false);
    try {
      sessionStorage.setItem(DESKTOP_SITE_NOTICE_DISMISSED_KEY, '1');
    } catch {
      // 저장소 접근이 차단돼도 현재 화면에서는 즉시 닫는다.
    }
  };

  return <DesktopSiteNoticeView onDismiss={dismiss} />;
}

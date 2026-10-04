import {
  DESKTOP_SITE_NOTICE_DISMISSED_KEY,
  DesktopSiteNotice,
  shouldShowDesktopSiteNotice,
} from '@/app/_components/desktop-site-notice';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const setBrowserSignals = ({
  maxTouchPoints = 1,
  coarsePointer = true,
  screenWidth = 412,
  screenHeight = 915,
  innerWidth = 980,
} = {}) => {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value: maxTouchPoints,
  });
  Object.defineProperty(window.screen, 'width', {
    configurable: true,
    value: screenWidth,
  });
  Object.defineProperty(window.screen, 'height', {
    configurable: true,
    value: screenHeight,
  });
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: innerWidth,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: coarsePointer,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('휴대폰 데스크톱 사이트 안내 감지 계약', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setBrowserSignals();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([
    ['터치 포인트', 1, false],
    ['거친 포인터', 0, true],
  ])(
    'DST-UNIT-001 정상: %s 신호가 있는 작은 화면의 넓은 뷰포트는 감지한다',
    (_, maxTouchPoints, coarsePointer) => {
      expect(
        shouldShowDesktopSiteNotice({
          maxTouchPoints,
          coarsePointer,
          screenWidth: 412,
          screenHeight: 915,
          innerWidth: 900,
        })
      ).toBe(true);
    }
  );

  it.each([
    ['터치 신호 없음', 0, false, 412, 915, 980],
    ['뷰포트 899 경계', 1, true, 412, 915, 899],
    ['짧은 변 768 경계', 1, true, 768, 1024, 980],
    ['태블릿 가로 회전', 1, true, 1024, 768, 1200],
    ['유효하지 않은 화면 크기', 1, true, 0, 0, 980],
  ])(
    'DST-UNIT-002 거절: %s이면 안내하지 않는다',
    (
      _,
      maxTouchPoints,
      coarsePointer,
      screenWidth,
      screenHeight,
      innerWidth
    ) => {
      expect(
        shouldShowDesktopSiteNotice({
          maxTouchPoints,
          coarsePointer,
          screenWidth,
          screenHeight,
          innerWidth,
        })
      ).toBe(false);
    }
  );

  it('DST-UNIT-003 정상: 안내를 닫으면 현재 세션에 숨김 상태를 저장한다', async () => {
    render(<DesktopSiteNotice />);

    fireEvent.click(
      await screen.findByRole('button', { name: '화면 표시 안내 닫기' })
    );

    expect(screen.queryByTestId('desktop-site-notice')).toBeNull();
    expect(sessionStorage.getItem(DESKTOP_SITE_NOTICE_DISMISSED_KEY)).toBe('1');
  });

  it('DST-UNIT-004 거절: 세션 저장소가 차단돼도 안내와 닫기가 동작한다', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    render(<DesktopSiteNotice />);
    fireEvent.click(
      await screen.findByRole('button', { name: '화면 표시 안내 닫기' })
    );

    expect(screen.queryByTestId('desktop-site-notice')).toBeNull();
  });
});

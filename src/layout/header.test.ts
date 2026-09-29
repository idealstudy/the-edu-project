import { describe, expect, it } from 'vitest';

import {
  shouldShowDesktopDiscoveryLinks,
  shouldShowMobileDiscoveryLinks,
} from './header-policy';

describe('Header D-034 모바일 메뉴', () => {
  it('MOB-MENU-01 일반 회원에게는 공개 탐색 메뉴를 유지한다', () => {
    expect(shouldShowMobileDiscoveryLinks('ROLE_MEMBER')).toBe(true);
  });

  it.each(['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_PARENT'])(
    'MOB-MENU-02 %s 전용 셸에서 D-034 가림 대상을 노출하지 않는다',
    (role) => {
      expect(shouldShowMobileDiscoveryLinks(role)).toBe(false);
    }
  );

  it('MOB-MENU-03 학생 헤더는 D-034 공개 탐색 항목을 모든 폭에서 숨긴다', () => {
    expect(shouldShowDesktopDiscoveryLinks('ROLE_STUDENT')).toBe(false);
    expect(shouldShowDesktopDiscoveryLinks('ROLE_TEACHER')).toBe(true);
    expect(shouldShowDesktopDiscoveryLinks('ROLE_PARENT')).toBe(true);
  });
});

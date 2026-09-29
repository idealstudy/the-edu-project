import SettingsPage from '@/app/(private)/settings/page';
import { useMemberStore } from '@/store';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/settings/components/account-settings', () => ({
  default: () => <section aria-label="계정" />,
}));

vi.mock('@/features/settings/components/notification-settings', () => ({
  default: () => <section aria-label="알림" />,
}));

describe('환경설정 역할별 앱 정보 노출', () => {
  afterEach(() => useMemberStore.getState().clearMember());

  it.each([
    ['ROLE_TEACHER', '선생님'],
    ['ROLE_STUDENT', '학생'],
    ['ROLE_PARENT', '학부모'],
  ] as const)(
    'TC-VERSION-005 정상: %s %s에게 앱 정보를 표시한다',
    (role, label) => {
      useMemberStore.getState().setMember({
        id: 1,
        email: `${label}@example.com`,
        name: label,
        role,
      });

      render(<SettingsPage />);

      expect(screen.getByRole('heading', { name: '앱 정보' })).toBeVisible();
      expect(screen.getByTestId('app-version')).toHaveTextContent('버전 v');
    }
  );
});

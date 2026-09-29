import AppInfo from '@/features/settings/components/app-info';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('환경설정 앱 정보', () => {
  it('TC-VERSION-001 정상: 버전, 커밋, 빌드 시각을 KST로 표시한다', () => {
    render(
      <AppInfo
        versionInfo={{
          version: '1.0.0',
          commit: 'abc1234',
          builtAt: '2026-09-29T14:50:00.000Z',
          env: 'preview',
        }}
      />
    );

    expect(screen.getByRole('heading', { name: '앱 정보' })).toBeVisible();
    expect(screen.getByTestId('app-version')).toHaveTextContent(
      '버전 v1.0.0 · 빌드 abc1234 · 2026-09-29 23:50 KST'
    );
  });

  it('TC-VERSION-002 거절: 잘못된 빌드 시각을 그럴듯한 날짜로 표시하지 않는다', () => {
    render(
      <AppInfo
        versionInfo={{
          version: '1.0.0',
          commit: 'local',
          builtAt: 'not-a-date',
          env: 'development',
        }}
      />
    );

    expect(screen.getByTestId('app-version')).toHaveTextContent(
      '버전 v1.0.0 · 빌드 local · 빌드 시각 미상'
    );
  });
});

import { resolveAppEnvironment } from '@/config/app-environment';
import { describe, expect, it } from 'vitest';

describe('resolveAppEnvironment', () => {
  it('TC-VERSION-005 정상: 개발 배포 주소는 dev로 판정한다', () => {
    expect(
      resolveAppEnvironment({
        baseUrl: 'https://dev.d-edu.site',
        projectProductionUrl: 'd-edu.site',
        vercelEnv: 'production',
      })
    ).toBe('dev');
  });

  it('TC-VERSION-006 정상: 운영 프로젝트 주소는 production으로 판정한다', () => {
    expect(
      resolveAppEnvironment({
        projectProductionUrl: 'd-edu.site',
        vercelEnv: 'production',
      })
    ).toBe('production');
  });

  it('TC-VERSION-007 정상: 알려진 배포 주소가 없는 Vercel Preview는 preview로 판정한다', () => {
    expect(
      resolveAppEnvironment({
        vercelEnv: 'preview',
      })
    ).toBe('preview');
  });

  it('TC-VERSION-008 경계: 배포 주소와 Vercel 환경값이 없으면 local로 판정한다', () => {
    expect(resolveAppEnvironment({})).toBe('local');
  });

  it('TC-VERSION-009 회귀: Preview는 운영 호스트보다 먼저 preview로 판정한다', () => {
    expect(
      resolveAppEnvironment({
        baseUrl: 'https://d-edu.site',
        vercelEnv: 'preview',
      })
    ).toBe('preview');
  });

  it('TC-VERSION-010 경계: dev를 제외한 d-edu.site 하위 호스트는 production으로 판정한다', () => {
    expect(
      resolveAppEnvironment({
        baseUrl: 'https://www.d-edu.site',
        vercelEnv: 'production',
      })
    ).toBe('production');
  });

  it('TC-VERSION-011 회귀: 이전한 운영 도메인 hongong.today와 www는 production, dev는 dev로 판정한다', () => {
    expect(
      resolveAppEnvironment({
        projectProductionUrl: 'hongong.today',
        vercelEnv: 'production',
      })
    ).toBe('production');
    expect(
      resolveAppEnvironment({
        baseUrl: 'https://www.hongong.today',
        vercelEnv: 'production',
      })
    ).toBe('production');
    expect(
      resolveAppEnvironment({
        baseUrl: 'https://dev.hongong.today',
        vercelEnv: 'production',
      })
    ).toBe('dev');
  });

  it('TC-VERSION-012 경계: 도메인 이름만 비슷한 호스트는 production으로 보지 않는다', () => {
    expect(
      resolveAppEnvironment({
        baseUrl: 'https://nothongong.today',
        vercelEnv: 'production',
      })
    ).toBe('local');
  });
});

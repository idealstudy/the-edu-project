import { shouldReloadForVersion } from '@/shared/lib/stale-version';
import { describe, expect, it } from 'vitest';

const server = { version: '2.0.5', commit: 'abc1234' };

describe('shouldReloadForVersion', () => {
  it('TC-VERSION-010 정상: 서버가 새 배포면 새로고침한다', () => {
    expect(shouldReloadForVersion('2.0.4+98165d1', server, null)).toBe(true);
  });
  it('TC-VERSION-011 정상: 같은 배포면 새로고침하지 않는다', () => {
    expect(shouldReloadForVersion('2.0.5+abc1234', server, null)).toBe(false);
  });
  it('TC-VERSION-012 거절: 같은 새 버전으로 이미 새로고침했으면 반복하지 않는다', () => {
    expect(
      shouldReloadForVersion('2.0.4+98165d1', server, '2.0.5+abc1234')
    ).toBe(false);
  });
  it('TC-VERSION-013 거절: 로컬 빌드나 이상한 응답은 판정하지 않는다', () => {
    expect(shouldReloadForVersion('unknown+local', server, null)).toBe(false);
    expect(shouldReloadForVersion('2.0.4+98165d1', {}, null)).toBe(false);
    expect(
      shouldReloadForVersion('2.0.4+98165d1', { version: 1, commit: 'x' }, null)
    ).toBe(false);
  });
});

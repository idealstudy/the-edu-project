import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  STALE_ASSET_GUARD,
  STALE_ASSET_RELOAD_COOLDOWN_MS,
  shouldReloadForAssetError,
} from '@/shared/lib/stale-asset-guard';
import { describe, expect, it } from 'vitest';

describe('옛 빌드 HTML 자가 복구', () => {
  it('TC-VERSION-020 정상: 정적 파일 적재 실패면 새로고침한다', () => {
    expect(
      shouldReloadForAssetError('/_next/static/css/abc.css', 0, 100_000)
    ).toBe(true);
  });
  it('TC-VERSION-021 거절: 1분 안에 또 실패하면 반복하지 않는다', () => {
    expect(
      shouldReloadForAssetError(
        '/_next/static/chunks/a.js',
        100_000,
        100_000 + STALE_ASSET_RELOAD_COOLDOWN_MS - 1
      )
    ).toBe(false);
  });
  it('TC-VERSION-022 거절: 외부 이미지·글꼴 실패는 무시한다', () => {
    expect(
      shouldReloadForAssetError('https://cdn.jsdelivr.net/x.css', 0, 100_000)
    ).toBe(false);
  });
  it('TC-VERSION-023 정상: 인라인 스크립트가 문법 오류 없이 만들어진다', () => {
    expect(() => new Function(STALE_ASSET_GUARD)).not.toThrow();
  });
});

describe('서비스워커 v2', () => {
  const sw = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');
  it('TC-VERSION-024 정상: 캐시 이름이 바뀌어 v1 캐시(옛 HTML)를 지운다', () => {
    expect(sw).toContain("CACHE_VERSION = 'dedu-pwa-v2'");
  });
  it('TC-VERSION-025 거절: 앱 HTML("/")을 precache·폴백으로 내지 않는다', () => {
    expect(sw).not.toMatch(/caches\.match\('\/'\)/);
    expect(sw).not.toMatch(/APP_SHELL = \[\s*'\/',/);
  });
});

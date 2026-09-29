import { GET } from '@/app/version.json/route';
import {
  APP_VERSION_IDENTITY,
  APP_VERSION_INFO,
} from '@/shared/lib/app-version';
import { describe, expect, it } from 'vitest';

describe('GET /version.json', () => {
  it('TC-VERSION-003 정상: 공개 배포 식별 정보를 no-store 응답으로 반환한다', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-app-version')).toBe(APP_VERSION_IDENTITY);
    await expect(response.json()).resolves.toEqual(APP_VERSION_INFO);
  });

  it('TC-VERSION-004 거절: 응답 형태에 계약 밖 필드를 노출하지 않는다', async () => {
    const response = await GET();
    const body = (await response.json()) as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual(
      ['builtAt', 'commit', 'env', 'version'].sort()
    );
    expect(body).not.toHaveProperty('token');
    expect(body).not.toHaveProperty('secret');
  });
});

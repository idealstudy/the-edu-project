import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [] }),
}));

describe('TC-API-003 공개 초대 BFF transport 경계', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  test('비로그인 preview GET과 accept POST는 같은 출처 BFF를 통과한다', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) =>
      new Response(
        JSON.stringify({ status: init.method === 'POST' ? 201 : 200, data: {} }),
        {
          status: init.method === 'POST' ? 201 : 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const route = await import('@/app/api/v1/[...path]/route');
    const { NextRequest } = await import('next/server');

    const preview = await route.GET(
      new NextRequest('https://dev.d-edu.site/api/v1/public/invites/token-91'),
      { params: Promise.resolve({ path: ['public', 'invites', 'token-91'] }) }
    );
    const accept = await route.POST(
      new NextRequest(
        'https://dev.d-edu.site/api/v1/public/invites/token-91/accept',
        { method: 'POST', body: JSON.stringify({ mode: 'EXISTING_ACCOUNT' }) }
      ),
      {
        params: Promise.resolve({
          path: ['public', 'invites', 'token-91', 'accept'],
        }),
      }
    );

    expect(preview.status).toBe(200);
    expect(accept.status).toBe(201);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/public/invites/token-91');
    expect(fetchMock.mock.calls[1]?.[0]).toContain(
      '/public/invites/token-91/accept'
    );
  });

  test('비로그인 private preference GET과 snooze PATCH의 backend 401을 그대로 보존한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ code: 'UNAUTHORIZED', message: '인증 필요' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    const route = await import('@/app/api/v1/[...path]/route');
    const { NextRequest } = await import('next/server');

    const preference = await route.GET(
      new NextRequest(
        'https://dev.d-edu.site/api/v1/student/teacher-invites/preference'
      ),
      {
        params: Promise.resolve({
          path: ['student', 'teacher-invites', 'preference'],
        }),
      }
    );
    const snooze = await route.PATCH(
      new NextRequest(
        'https://dev.d-edu.site/api/v1/student/teacher-invites/snooze',
        { method: 'PATCH', body: JSON.stringify({ mode: 'THREE_DAYS' }) }
      ),
      {
        params: Promise.resolve({
          path: ['student', 'teacher-invites', 'snooze'],
        }),
      }
    );

    expect(preference.status).toBe(401);
    expect(snooze.status).toBe(401);
  });
});

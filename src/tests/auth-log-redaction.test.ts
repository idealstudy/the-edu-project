import { NextRequest } from 'next/server';

import {
  GET as proxyGet,
  POST as proxyPost,
} from '@/app/api/v1/[...path]/route';
import { GET as dashboardGet } from '@/app/api/v1/dashboard/route';
import { middleware } from '@/middleware';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { inspect } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SYNTHETIC_SECRET_MARKER = 'synthetic-secret-marker-4f36c09b';
const SYNTHETIC_PII_MARKER = 'student-marker@example.invalid';

const cookieMocks = vi.hoisted(() => ({
  getAll: vi.fn(),
}));
const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ getAll: cookieMocks.getAll })),
}));

vi.mock('@/shared/api/http', () => ({
  api: { bff: { server: { get: apiMocks.get } } },
}));

const consoleSinks = ['debug', 'error', 'info', 'log', 'warn'] as const;
type ConsoleSink = (typeof consoleSinks)[number];

function sourceFilesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return sourceFilesUnder(path);
    }
    return /\.[cm]?[jt]sx?$/.test(entry) ? [path] : [];
  });
}

describe('인증 경로 서버 로그 비밀값 방어', () => {
  let spies: Record<ConsoleSink, ReturnType<typeof vi.spyOn>>;

  beforeEach(() => {
    spies = Object.fromEntries(
      consoleSinks.map((sink) => [
        sink,
        vi.spyOn(console, sink).mockImplementation(() => undefined),
      ])
    ) as Record<ConsoleSink, ReturnType<typeof vi.spyOn>>;

    cookieMocks.getAll.mockReturnValue([
      { name: 'Authorization', value: SYNTHETIC_SECRET_MARKER },
      { name: 'refresh-token', value: SYNTHETIC_SECRET_MARKER },
    ]);
    apiMocks.get.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const consoleOutput = () =>
    consoleSinks
      .flatMap((sink) => spies[sink].mock.calls)
      .map((args) =>
        args.map((value) => inspect(value, { depth: 8 })).join(' ')
      )
      .join('\n');

  const expectNoServerConsoleOutput = () => {
    const output = consoleOutput();

    expect(output).not.toContain(SYNTHETIC_SECRET_MARKER);
    expect(output).not.toContain(SYNTHETIC_PII_MARKER);
    for (const sink of consoleSinks) {
      expect(spies[sink]).not.toHaveBeenCalled();
    }
  };

  it('TC-SEC-002 정상: middleware가 쿠키, 인증 헤더, PII 헤더, 요청 객체를 console sink에 남기지 않는다', () => {
    const request = new NextRequest(
      `http://localhost:3000/dashboard/student?invite=${SYNTHETIC_SECRET_MARKER}`,
      {
        headers: {
          authorization: `Bearer ${SYNTHETIC_SECRET_MARKER}`,
          cookie: `Authorization=${SYNTHETIC_SECRET_MARKER}`,
          'x-student-email': SYNTHETIC_PII_MARKER,
        },
      }
    );

    expect(middleware(request).status).toBe(200);
    expectNoServerConsoleOutput();
  });

  it('TC-SEC-002 정상: BFF가 production 요청의 URL, path/query token, 쿠키, 헤더, 응답 PII를 console sink에 남기지 않는다', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const backendResponse = JSON.stringify({
      email: SYNTHETIC_PII_MARKER,
      accessToken: SYNTHETIC_SECRET_MARKER,
    });
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      Response.json(JSON.parse(backendResponse), { status: 200 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      `http://localhost:3000/api/v1/invitations/${SYNTHETIC_SECRET_MARKER}?token=${SYNTHETIC_SECRET_MARKER}&email=${encodeURIComponent(SYNTHETIC_PII_MARKER)}`,
      {
        headers: {
          authorization: `Bearer ${SYNTHETIC_SECRET_MARKER}`,
          cookie: `Authorization=${SYNTHETIC_SECRET_MARKER}`,
        },
      }
    );

    const response = await proxyGet(request, {
      params: Promise.resolve({
        path: ['invitations', SYNTHETIC_SECRET_MARKER],
      }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      SYNTHETIC_SECRET_MARKER
    );
    expect(await response.json()).toEqual(JSON.parse(backendResponse));
    expectNoServerConsoleOutput();
  });

  it('TC-SEC-002 거절: BFF가 production POST 본문과 비2xx 응답의 token 및 PII도 console sink에 남기지 않는다', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      Response.json(
        {
          code: 'SYNTHETIC_BAD_REQUEST',
          message: SYNTHETIC_PII_MARKER,
        },
        { status: 400 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = new NextRequest(
      `http://localhost:3000/api/v1/invitations/${SYNTHETIC_SECRET_MARKER}?token=${SYNTHETIC_SECRET_MARKER}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${SYNTHETIC_SECRET_MARKER}`,
          'content-type': 'application/json',
          cookie: `Authorization=${SYNTHETIC_SECRET_MARKER}`,
        },
        body: JSON.stringify({
          token: SYNTHETIC_SECRET_MARKER,
          email: SYNTHETIC_PII_MARKER,
        }),
      }
    );

    const response = await proxyPost(request, {
      params: Promise.resolve({
        path: ['invitations', SYNTHETIC_SECRET_MARKER],
      }),
    });

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain(
      SYNTHETIC_SECRET_MARKER
    );
    expectNoServerConsoleOutput();
  });

  it('TC-SEC-002 정적 방어: middleware와 모든 app/api/v1 소스는 console sink를 호출하지 않는다', () => {
    const protectedSources = [
      resolve(process.cwd(), 'src/middleware.ts'),
      ...sourceFilesUnder(resolve(process.cwd(), 'src/app/api/v1')),
    ];

    for (const sourcePath of protectedSources) {
      const source = readFileSync(sourcePath, 'utf8');
      expect(source, sourcePath).not.toMatch(/\bconsole\s*\./);
    }
  });

  it('TC-SEC-002 거절: dashboard 예상 밖 500은 비밀값 없이 안전 이벤트를 한 번 기록한다', async () => {
    const stderrWrite = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    apiMocks.get.mockRejectedValue(
      new Error(
        `${SYNTHETIC_SECRET_MARKER} ${SYNTHETIC_PII_MARKER} Authorization Bearer`
      )
    );

    const response = await dashboardGet();
    const correlationId = response.headers.get('x-correlation-id');

    expect(response.status).toBe(500);
    expect(correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(stderrWrite).toHaveBeenCalledOnce();

    const sinkLine = String(stderrWrite.mock.calls[0]?.[0]);
    const sinkPayload = JSON.parse(sinkLine) as Record<string, string>;
    expect(Object.keys(sinkPayload)).toEqual([
      'eventId',
      'route',
      'errorClass',
      'correlationId',
    ]);
    expect(sinkPayload).toEqual({
      eventId: 'DASHBOARD_BFF_UNEXPECTED_ERROR',
      route: '/api/v1/dashboard',
      errorClass: 'Error',
      correlationId,
    });
    expect(sinkLine.endsWith('\n')).toBe(true);
    expect(sinkLine).not.toContain(SYNTHETIC_SECRET_MARKER);
    expect(sinkLine).not.toContain(SYNTHETIC_PII_MARKER);
    expect(sinkLine).not.toContain('Authorization');
    expect(sinkLine).not.toContain('Bearer');
    expectNoServerConsoleOutput();
  });
});

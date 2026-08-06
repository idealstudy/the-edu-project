import { NextRequest } from 'next/server';

import { middleware } from '@/middleware';
import { describe, expect, it } from 'vitest';

const token = (role: string) => {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString(
    'base64url'
  );
  const payload = Buffer.from(JSON.stringify({ auth: role })).toString(
    'base64url'
  );
  return `${header}.${payload}.signature`;
};

const request = (role: string) =>
  new NextRequest('http://localhost:3000/admin/members', {
    headers: { cookie: `Authorization=${token(role)}` },
  });

describe('/admin middleware guard', () => {
  it('학생 증표를 403 화면으로 돌린다', () => {
    const response = middleware(request('ROLE_STUDENT'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/403');
  });

  it('관리자 증표는 통과시킨다', () => {
    const response = middleware(request('ROLE_ADMIN'));
    expect(response.status).toBe(200);
  });
});

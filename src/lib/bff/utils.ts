import { NextResponse } from 'next/server';

import {
  MemberEnvelopeSchema,
  MemberSchema,
} from '@/features/member/model/schema';
import { Member } from '@/features/member/model/types';

export const safeJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const normalizeMember = (payload: unknown): Member => {
  const envelope = MemberEnvelopeSchema.safeParse(payload);
  if (envelope.success) {
    return MemberSchema.parse(envelope.data.data);
  }

  return MemberSchema.parse(payload);
};

export const extractErrorMessage = (payload: unknown): string | undefined => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return (payload as { message: string }).message;
  }

  return undefined;
};

export const getSetCookies = (response: Response): string[] => {
  const header = response.headers as unknown as {
    getSetCookie?: () => string[];
  };

  if (typeof header.getSetCookie === 'function') {
    return header.getSetCookie();
  }

  const single = response.headers.get('set-cookie');
  return single ? [single] : [];
};

export const createSessionCookieHeader = (setCookies: string[]): string => {
  return setCookies
    .map((cookie) => cookie.split(';')[0])
    .filter(Boolean)
    .join('; ');
};

export function appendSetCookies(
  res: NextResponse,
  setCookies: string[] = []
): void {
  for (const cookie of setCookies) res.headers.append('Set-Cookie', cookie);
}

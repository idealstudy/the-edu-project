import { sessionEnvelope } from '@/features/auth/schemas/login';
import { authService } from '@/features/auth/services/api';
import { getSessionToken } from '@/features/auth/services/session-token';
import { Session, SessionPayload } from '@/features/auth/type';
import { AuthError } from '@/lib/error';
import * as jose from 'jose';

const parseSessionPayload = (payload: SessionPayload): Session => {
  const role = payload.auth ?? payload.role;
  if (!role) throw new Error('역할 정보가 없습니다.');
  return Session.parse({
    auth: role,
    memberId: payload.memberId,
    email: payload.email,
    name: payload.name ?? undefined,
    nickname: payload.nickname ?? payload.name ?? undefined,
  });
};

const parseSessionResponse = (response: unknown): Session | null => {
  if (response == null) return null;

  const direct = SessionPayload.safeParse(response);
  if (direct.success) return parseSessionPayload(direct.data);

  const envelope = sessionEnvelope.safeParse(response);
  if (envelope.success) {
    const payload = envelope.data.data ?? envelope.data.result;
    if (!payload) return null;
    return parseSessionPayload(payload);
  }

  throw new Error('알 수 없는 세션 응답 형식입니다.');
};

export const getSession = async () => {
  try {
    const response = await authService.getSession();
    return parseSessionResponse(response);
  } catch (error) {
    if (error instanceof AuthError) return null;
    throw error;
  }
};

/**
 * 임시용 로컬 세션 파서
 * AccessToken을 직접 디코딩해서 사용자 정보를 추출합니다.
 * 추후 사용자 정보 API로 대체 예정
 */
export const parseLocalSession = (token: string): Session => {
  const decoded = jose.decodeJwt(token);
  return Session.parse(decoded);
};

export const getLocalSession = (): Session | null => {
  const sessionToken = getSessionToken();

  if (!sessionToken) return null;

  try {
    return parseLocalSession(sessionToken);
  } catch {
    return null;
  }
};

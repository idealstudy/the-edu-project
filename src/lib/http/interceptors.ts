import { AuthError, ForbiddenError } from '@/lib/error';
import { authHttp } from '@/lib/http/clients';
import { ensureRefreshSession } from '@/lib/http/refresh';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function getStatus(e: AxiosError) {
  return e.response?.status;
}

function getMessage(e: AxiosError) {
  return (e.response?.data as { message?: string } | undefined)?.message;
}

function isForbidden(e: AxiosError) {
  return getStatus(e) === 403;
}

function isUnauthorized(e: AxiosError) {
  return getStatus(e) === 401;
}

function isRefreshCall(e: AxiosError, cfg: RetryableConfig) {
  const url = cfg.url ?? e.response?.config?.url ?? '';
  return url.includes('/auth/refresh');
}

function markRetry(cfg: RetryableConfig) {
  cfg._retry = true;
  return cfg;
}

export const installHttpInterceptors = () => {
  const requestId = authHttp.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => Promise.reject(error)
  );

  const responseId = authHttp.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const cfg = (error.config || {}) as RetryableConfig;
      if (!error.response) return Promise.reject(error);

      if (isForbidden(error)) {
        throw new ForbiddenError(getMessage(error) ?? '접근이 거부되었습니다.');
      }

      if (!isUnauthorized(error)) {
        return Promise.reject(error);
      }

      // 401이거나 이미 재시도한 요청이면 종료
      if (cfg._retry || isRefreshCall(error, cfg)) {
        throw new AuthError(getMessage(error) ?? '세션이 만료되었습니다.');
      }

      try {
        await ensureRefreshSession();
        return authHttp(markRetry(cfg));
      } catch {
        throw new AuthError('세션이 만료되었습니다.');
      }
    }
  );

  return () => {
    authHttp.interceptors.request.eject(requestId);
    authHttp.interceptors.response.eject(responseId);
  };
};

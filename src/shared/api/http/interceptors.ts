import { ensureRefreshSession } from '@/shared/api';
import { ShowErrorToast } from '@/shared/lib';
import { AuthError } from '@/shared/lib/error';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { http } from './http.transport';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function getStatus(e: AxiosError) {
  return e.response?.status;
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
  const requestId = http.private.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => Promise.reject(error)
  );

  const responseId = http.private.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const cfg = (error.config || {}) as RetryableConfig;

      // 1. 네트워크 에러
      if (!error.response) {
        ShowErrorToast('NETWORK_ERROR', '네트워크 오류가 발생했습니다.');
        throw error;
      }

      // 2. 서버 장애
      if (getStatus(error)! >= 500) {
        ShowErrorToast('SERVER_ERROR', '서버 오류가 발생했습니다.');
        throw error;
      }

      // 3. 401 refresh 실패
      if (isUnauthorized(error)) {
        if (cfg._retry || isRefreshCall(error, cfg)) {
          ShowErrorToast('SESSION_EXPIRED', '세션이 만료되었습니다.');
          throw new AuthError('SESSION_EXPIRED');
        }

        await ensureRefreshSession();
        return http.private(markRetry(cfg));
      }

      // 4. 그 외는 관여하지 않음
      throw error;
    }
  );

  return () => {
    http.private.interceptors.request.eject(requestId);
    http.private.interceptors.response.eject(responseId);
  };
};

import { ensureRefreshSession } from '@/shared/api';
import { ShowErrorToast } from '@/shared/components/ui';
import { AuthError } from '@/shared/lib/error';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { http } from './http.transport';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function getStatus(e: AxiosError) {
  return e.response?.status;
}

// function getMessage(e: AxiosError) {
//   return (e.response?.data as { message?: string } | undefined)?.message;
// }

// function isForbidden(e: AxiosError) {
//   return getStatus(e) === 403;
// }

// function isProfileIncomplete(e: AxiosError) {
//   const message = getMessage(e);

//   return (
//     getStatus(e) === 403 &&
//     (message === 'PROFILE_COMPLETION_REQUIRED' ||
//       message?.includes('프로필 완성'))
//   );
// }

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

    // 이전 코드들

    // async (error: AxiosError) => {
    //   const cfg = (error.config || {}) as RetryableConfig;
    //   if (!error.response) return Promise.reject(error);

    //   if (isProfileIncomplete(error)) {
    //     window.location.href = '/select-role';
    //     return Promise.reject(error);
    //   }

    //   if (isForbidden(error)) {
    //     throw new ForbiddenError(getMessage(error) ?? '접근이 거부되었습니다.');
    //   }

    //   if (!isUnauthorized(error)) {
    //     return Promise.reject(error);
    //   }

    //   // 401이거나 이미 재시도한 요청이면 종료
    //   if (cfg._retry || isRefreshCall(error, cfg)) {
    //     throw new AuthError(getMessage(error) ?? '세션이 만료되었습니다.');
    //   }

    //   try {
    //     await ensureRefreshSession();
    //     return http.private(markRetry(cfg));
    //   } catch {
    //     throw new AuthError('세션이 만료되었습니다.');
    //   }
    // }
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

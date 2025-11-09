import { authBffHttp, authHttp, publicHttp } from '@/lib/http';
import type { AxiosInstance } from 'axios';

// HTTP 요청 래퍼
const createApi = (httpInstance: AxiosInstance) => ({
  get: async <T = unknown>(
    ...a: Parameters<AxiosInstance['get']>
  ): Promise<T> => (await httpInstance.get<T>(...a)).data,
  post: async <T = unknown>(
    ...a: Parameters<AxiosInstance['post']>
  ): Promise<T> => (await httpInstance.post<T>(...a)).data,
  put: async <T = unknown>(
    ...a: Parameters<AxiosInstance['put']>
  ): Promise<T> => (await httpInstance.put<T>(...a)).data,
  patch: async <T = unknown>(
    ...a: Parameters<AxiosInstance['patch']>
  ): Promise<T> => (await httpInstance.patch<T>(...a)).data,
  delete: async <T = unknown>(
    ...a: Parameters<AxiosInstance['delete']>
  ): Promise<T> => (await httpInstance.delete<T>(...a)).data,
});

// NOTE: publicApi - 비로그인 상태에서도 호출 가능한 API
export const publicApi = createApi(publicHttp);

// NOTE: authApi - 로그인(인증 쿠키) 필요 API
export const authApi = createApi(authHttp);

// NOTE: BFF 전용
export const authBffApi = createApi(authBffHttp);

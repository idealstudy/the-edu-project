import { authHttp, publicHttp } from '@/lib/http';
import type { AxiosInstance } from 'axios';

// HTTP 요청 래퍼
// NOTE: publicApi - 비로그인 상태에서도 호출 가능한 API
export const publicApi = {
  get: async <T = unknown>(
    ...args: Parameters<AxiosInstance['get']>
  ): Promise<T> => {
    const response = await publicHttp.get<T>(...args);
    return response.data;
  },

  post: async <T = unknown>(
    ...args: Parameters<AxiosInstance['post']>
  ): Promise<T> => {
    const response = await publicHttp.post<T>(...args);
    return response.data;
  },
};

// NOTE: authApi - 로그인(인증 쿠키) 필요 API
export const authApi = {
  get: async <T = unknown>(
    ...args: Parameters<AxiosInstance['get']>
  ): Promise<T> => {
    const response = await authHttp.get<T>(...args);
    return response.data;
  },

  post: async <T = unknown>(
    ...args: Parameters<AxiosInstance['post']>
  ): Promise<T> => {
    const response = await authHttp.post<T>(...args);
    return response.data;
  },

  put: async <T = unknown>(
    ...args: Parameters<AxiosInstance['put']>
  ): Promise<T> => {
    const response = await authHttp.put<T>(...args);
    return response.data;
  },

  patch: async <T = unknown>(
    ...args: Parameters<AxiosInstance['patch']>
  ): Promise<T> => {
    const response = await authHttp.patch<T>(...args);
    return response.data;
  },

  delete: async <T = unknown>(
    ...args: Parameters<AxiosInstance['delete']>
  ): Promise<T> => {
    const response = await authHttp.delete<T>(...args);
    return response.data;
  },
};

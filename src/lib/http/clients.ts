import { AuthError, ForbiddenError } from '@/lib/error';
import axios from 'axios';

export const BASE_URL = 'https://dev.the-edu.site/api';

// 인증 쿠키 포함 클라이언트
export const authHttp = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공개 API용 (비로그인 상태에서도 가능한 요청)
export const publicHttp = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

authHttp.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401) throw new AuthError(message);
    if (status === 403) throw new ForbiddenError(message);
    return Promise.reject(error);
  }
);

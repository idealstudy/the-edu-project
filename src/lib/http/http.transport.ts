import { env } from '@/lib/bff/config.env';
import axios from 'axios';

// NOTE: 인증 필요한 요청 전용 (쿠키 자동 포함)
export const authHttp = axios.create({
  baseURL: env.backendApiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: 공개 요청 전용 (기본은 쿠키 미포함, 비로그인 상태에서도 가능)
export const publicHttp = axios.create({
  baseURL: env.backendApiUrl,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: 리프레시 전용 (인터셉터 절대 붙이면 안 됨)
export const authBffHttp = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

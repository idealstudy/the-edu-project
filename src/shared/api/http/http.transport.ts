import { env } from '@/shared/constants/api';
import axios from 'axios';

// NOTE: 인증 필요한 요청 전용 (쿠키 자동 포함)
const privateHttp = axios.create({
  baseURL: env.backendApiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: 공개 요청 전용 (기본은 쿠키 미포함, 비로그인 상태에서도 가능)
const publicHttp = axios.create({
  baseURL: env.backendApiUrl,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: 인증 API 전용 (인터셉터 절대 붙이면 안 됨)
const authenticatedHttp = axios.create({
  baseURL: env.backendApiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: 리프레시 전용 (인터셉터 절대 붙이면 안 됨)
const clientToBffHttp = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// NOTE: 서버에서 BFF로 요청 전용
const serverToBffHttp = axios.create({
  /* ─────────────────────────────────────────────────────
   * Next.js 라우터 핸들러는 서버 환경이므로
   * withCredentials 는 보통 필요 없음
   * 대신 인증 정보는 서버 환경 변수나 요청 헤더를 통해 처리
   * ────────────────────────────────────────────────────*/
  baseURL: env.backendApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const bff = {
  client: clientToBffHttp,
  server: serverToBffHttp,
};

export const http = {
  public: publicHttp,
  private: privateHttp,
  authenticated: authenticatedHttp,
  bff,
};

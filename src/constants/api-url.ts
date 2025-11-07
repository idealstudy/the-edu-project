import { DEFAULT_BACKEND_API_URL, env, serverEnv } from '@/lib';

// 테스트 전용
// BFF/Next.js API Route 엔드포인트
// 테스트 환경에서 vite.config.ts NEXT_PUBLIC_BASE_URL 값
// export const BFF_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * 공용 클라이언트 번들에서 사용하는 백엔드 API 기본 URL
 * 테스트 환경에서는 환경 변수가 없을 수 있으므로 기본값으로 폴백
 */
export const API_BASE_URL: string =
  env.backendApiUrl ?? DEFAULT_BACKEND_API_URL;

/** Next.js Route Handler 등 서버 전용 환경에서 사용하는 백엔드 API 기본 URL */
export const SERVER_API_BASE_URL: string =
  serverEnv.backendApiUrl ?? DEFAULT_BACKEND_API_URL;

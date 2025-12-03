// vercel 에서 NEXT_PUBLIC_BACKEND_API_URL, BACKEND_API_URL 환경 변수 설정 동일하게 필요
// 단 develop, main 브랜치 별로 다르게 설정
const DEFAULT_BACKEND_API_URL = 'https://api.dev.the-edu.site/api';

const sanitize = (value: string | undefined) =>
  value && value.trim().length > 0 ? value.trim() : undefined;

/* ─────────────────────────────────────────────────────
 * 공용 클라이언트 번들에서 사용하는 백엔드 API 기본 URL
 * 테스트 환경에서는 환경 변수가 없을 수 있으므로 기본값으로 폴백
 * ────────────────────────────────────────────────────*/
const publicBackendUrl =
  sanitize(process.env.NEXT_PUBLIC_BACKEND_API_URL) ?? DEFAULT_BACKEND_API_URL;

/* ─────────────────────────────────────────────────────
 * Next.js Route Handler 등 서버 전용 환경에서 사용하는 백엔드 API 기본 URL
 * BFF가 스프링 서버로 요청을 보낼 때 사용
 * ────────────────────────────────────────────────────*/
const serverBackendUrl =
  sanitize(process.env.BACKEND_API_URL) ?? publicBackendUrl;

export const env = {
  backendApiUrl: publicBackendUrl,
};

export const serverEnv = {
  backendApiUrl: serverBackendUrl,
};

export { DEFAULT_BACKEND_API_URL };

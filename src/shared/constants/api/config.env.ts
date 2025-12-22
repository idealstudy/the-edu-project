// vercel 에서 NEXT_PUBLIC_BACKEND_API_URL, BACKEND_API_URL 환경 변수 설정안해도 되게함.
//
const DEFAULT_DEV_BACKEND_API_URL = 'https://api.dev.d-edu.site/api';
const DEFAULT_PROD_BACKEND_API_URL = 'https://api.d-edu.site/api';

const sanitize = (value: string | undefined) =>
  value && value.trim().length > 0 ? value.trim() : undefined;

/**
 * 백엔드 URL 결정
 * - 서버 사이드: VERCEL_ENV를 사용하여 프로덕션/개발 환경 구분
 * - 클라이언트 사이드: window.location.hostname을 사용하여 런타임에 환경 구분
 */
const getBackendUrl = () => {
  // 서버 사이드: VERCEL_ENV 확인
  if (typeof window === 'undefined') {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv === 'production') {
      return DEFAULT_PROD_BACKEND_API_URL;
    }
    // preview, development, 또는 로컬
    return DEFAULT_DEV_BACKEND_API_URL;
  }

  // 클라이언트 사이드: 현재 호스트를 기반으로 결정
  const hostname = window.location.hostname;

  // 프로덕션 도메인
  if (hostname === 'd-edu.site' || hostname === 'www.d-edu.site') {
    return DEFAULT_PROD_BACKEND_API_URL;
  }

  // 개발 도메인
  if (hostname === 'dev.d-edu.site') {
    return DEFAULT_DEV_BACKEND_API_URL;
  }

  // 로컬 환경 (localhost 등)
  return DEFAULT_DEV_BACKEND_API_URL;
};

/* ─────────────────────────────────────────────────────
 * 공용 클라이언트 번들에서 사용하는 백엔드 API 기본 URL
 * 우선순위:
 * 1. NEXT_PUBLIC_BACKEND_API_URL 환경 변수 (빌드 시점에 클라이언트 번들에 포함)
 * 2. getBackendUrl() - 런타임에 호스트 확인 (클라이언트) 또는 VERCEL_ENV 확인 (서버)
 * ────────────────────────────────────────────────────*/
const publicBackendUrl =
  sanitize(process.env.NEXT_PUBLIC_BACKEND_API_URL) ?? getBackendUrl();

/* ─────────────────────────────────────────────────────
 * Next.js Route Handler 등 서버 전용 환경에서 사용하는 백엔드 API 기본 URL
 * BFF가 스프링 서버로 요청을 보낼 때 사용
 *
 * 중요: serverBackendUrl은 절대 undefined가 될 수 없습니다.
 * getBackendUrl()은 항상 문자열을 반환하므로 최종 fallback으로 사용합니다.
 * ────────────────────────────────────────────────────*/
const serverBackendUrl =
  sanitize(process.env.BACKEND_API_URL) ?? publicBackendUrl ?? getBackendUrl();

// 타입 안전성 보장: 절대 undefined가 아님을 확인
if (!serverBackendUrl) {
  throw new Error(
    'serverBackendUrl must be defined. This should never happen.'
  );
}

export const env = {
  backendApiUrl: publicBackendUrl,
};

export const serverEnv = {
  backendApiUrl: serverBackendUrl,
};

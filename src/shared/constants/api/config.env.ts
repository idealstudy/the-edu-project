// vercel 에서 NEXT_PUBLIC_BACKEND_API_URL 으로 환경변수 관리중

const sanitize = (value: string | undefined) =>
  value && value.trim().length > 0 ? value.trim() : undefined;

/* ─────────────────────────────────────────────────────
 * 공용 클라이언트 번들에서 사용하는 백엔드 API 기본 URL
 * ────────────────────────────────────────────────────*/
const publicBackendUrl = sanitize(process.env.NEXT_PUBLIC_BACKEND_API_URL);

/* ─────────────────────────────────────────────────────
 * Next.js Route Handler 등 서버 전용 환경에서 사용하는 백엔드 API 기본 URL
 * BFF가 스프링 서버로 요청을 보낼 때 사용
 * BACKEND_API_URL은 마이크로 서비스 아키텍쳐에서 사용가능 (확장성)
 * ────────────────────────────────────────────────────*/
const serverBackendUrl =
  sanitize(process.env.BACKEND_API_URL) ?? publicBackendUrl;

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

// 테스트 전용
// BFF/Next.js API Route 엔드포인트
// 테스트 환경에서 vite.config.ts NEXT_PUBLIC_BASE_URL 값
// export const BFF_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// BFF가 호출하는 실제 백엔드 API 주소(외부 API)
// 핸들러 내부의 fetch 요청을 가로채기 위해 사용
export const API_BASE_URL = 'https://api.dev.the-edu.site/api';

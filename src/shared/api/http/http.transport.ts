import { env } from '@/shared/constants/api';
import axios from 'axios';

const isServer = typeof window === 'undefined';

// NOTE: 인증 필요한 요청 전용 (쿠키 자동 포함)
const privateHttp = axios.create({
  /* ─────────────────────────────────────────────────────
   * 로컬 환경에서는 Cross site 문제로 localhost -> 백엔드서버 쿠키요청이 안됨
   * 따라서 /api/v1 경로로 요청하도록 설정하며 app/v1/[...path] 라우터 핸들러를 통해 쿠키를 붙여 백엔드로 프록시
   * ────────────────────────────────────────────────────*/
  // baseURL: env.backendApiUrl,
  baseURL: isServer ? env.backendApiUrl : '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: 공개 요청 전용 (기본은 쿠키 미포함, 비로그인 상태에서도 가능)
// 결함(2026-08-12, 회장 실측): 클라이언트에서 이 인스턴스가 백엔드 주소로
// 직접 요청해 브라우저가 크로스오리진으로 막았다(apidev.d-edu.site가 dev
// 환경 CORS를 안 열어줌 — 운영도 프론트/백엔드 호스트가 갈려 동일 문제).
// privateHttp와 같은 원칙을 따른다: 브라우저에서는 항상 앱 자신의
// /api/v1 프록시(app/api/v1/[...path]/route.ts)를 거친다. 그 프록시는
// 쿠키 유무와 무관하게 모든 경로를 백엔드로 그대로 전달하므로 공개
// 엔드포인트도 문제없이 통과한다.
const publicHttp = axios.create({
  // MAJOR 21 보류: 같은 출처 BFF가 인증 쿠키를 전달하지 않게 하려면 프록시
  // 계약 변경이 필요하다. 백엔드/BFF 별건이라 이번 프론트 화면 수정에서는 유지한다.
  baseURL: isServer ? env.backendApiUrl : '/api/v1',
  withCredentials: false,
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
  bff,
};

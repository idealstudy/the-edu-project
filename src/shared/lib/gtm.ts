/**
 * Google Tag Manager (GTM) / Google Analytics 4 (GA4) 이벤트 트래킹 유틸리티
 *
 * 사용 방법:
 * 1. pushEvent('이벤트명', { 파라미터1: 값1, 파라미터2: 값2 })
 * 2. 예시: pushEvent('dashboard_page_view', { user_type: getGaUserType(role) })
 */

// TypeScript 전역 타입 선언: window.dataLayer 배열 타입 정의
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

/**
 * 내부 역할(ROLE_*)을 GA4 유저 타입으로 변환
 *
 * @param role - 내부 역할 코드 (ROLE_TEACHER, ROLE_STUDENT, ROLE_PARENT, ROLE_ADMIN)
 * @returns GA4용 유저 타입 ('teacher', 'student', 'guardian', 'admin', 'not')
 *
 * 공통 파라미터 규칙:
 * - teacher: 선생님
 * - student: 학생
 * - guardian: 보호자
 * - not: 비로그인 사용자
 */
export const getGaUserType = (role?: string | null): string => {
  if (!role) return 'not';
  const mapping: Record<string, string> = {
    ROLE_TEACHER: 'teacher',
    ROLE_STUDENT: 'student',
    ROLE_PARENT: 'guardian',
    ROLE_ADMIN: 'admin',
  };
  return mapping[role] || 'not';
};

/**
 * GTM dataLayer에 이벤트를 푸시하는 함수
 *
 * @param event - 이벤트 이름 (예: 'dashboard_page_view', 'gnb_logo_click')
 * @param params - 이벤트 파라미터 객체 (예: { user_type: 'teacher', room_id: 123 })
 *
 * 동작 원리:
 * 1. window.dataLayer 배열이 없으면 초기화
 * 2. { event: '이벤트명', ...params } 형태로 객체를 dataLayer에 추가
 * 3. GTM이 이 데이터를 감지하고 설정된 Tag(GA4 Event Tag 등)로 전송
 *
 * 서버 사이드 렌더링(SSR) 환경에서는 실행되지 않습니다 (typeof window === 'undefined' 체크)
 */
export const pushEvent = (
  event: string,
  params?: Record<string, unknown>
): void => {
  // Next.js SSR 환경에서는 window 객체가 없으므로 early return
  if (typeof window === 'undefined') return;

  // dataLayer가 없으면 빈 배열로 초기화
  window.dataLayer = window.dataLayer || [];

  // 이벤트와 파라미터를 함께 dataLayer에 푸시
  // GTM Trigger가 'event' 키워드를 감지하여 해당 이벤트를 처리합니다
  window.dataLayer.push({ event, ...params });
};

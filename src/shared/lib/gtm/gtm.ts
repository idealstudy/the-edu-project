/**
 * GTM (Google Tag Manager) 유틸리티 함수
 *
 * dataLayer를 통해 GTM으로 이벤트를 전송합니다.
 *
 * @deprecated 새로운 이벤트는 src/shared/lib/gtm/trackers.ts의 헬퍼 함수를 사용하세요.
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 */

// dataLayer 타입 정의
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

/**
 * 내부 역할 코드를 GA4용 user_type으로 변환
 * @param role - 내부 역할 코드 (ROLE_TEACHER, ROLE_STUDENT, ROLE_PARENT, ROLE_ADMIN) 또는 null
 * @returns GA4용 user_type ('teacher', 'student', 'guardian', 'not')
 */
export const getGaUserType = (
  role: string | null | undefined
): 'teacher' | 'student' | 'guardian' | 'not' => {
  if (!role) return 'not';

  switch (role) {
    case 'ROLE_TEACHER':
      return 'teacher';
    case 'ROLE_STUDENT':
      return 'student';
    case 'ROLE_PARENT':
      return 'guardian';
    case 'ROLE_ADMIN':
      return 'teacher'; // 관리자는 teacher로 분류
    default:
      return 'not';
  }
};

/**
 * GTM dataLayer로 이벤트 전송
 * @param event - 이벤트 이름 (예: 'gnb_logo_click')
 * @param params - 이벤트와 함께 전송할 파라미터 (예: { user_type: 'teacher' })
 */
export const pushEvent = (
  event: string,
  params?: Record<string, unknown>
): void => {
  // SSR 환경에서는 실행하지 않음 (window 객체가 없음)
  if (typeof window === 'undefined') return;

  // dataLayer 초기화
  window.dataLayer = window.dataLayer || [];

  // 이벤트와 파라미터를 dataLayer에 푸시
  window.dataLayer.push({
    event,
    ...params,
  });
};

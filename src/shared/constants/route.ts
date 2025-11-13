// 프론트엔드 내비게이션 경로 관리
export const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/register',
  DASHBOARD: {
    HOME: '/dashboard',
    STUDYROOM: {
      DETAIL: (id: number) => `/study-rooms/${id}/note`,
      CREATE: '/study-rooms/new',
    },
    STUDYNOTE: {
      CREATE: '/dashboard/study-note/new',
      DETAIL: (id: number) => `/dashboard/study-note/${id}`,
      LIST: (id: number) => `/study-rooms/${id}/note`,
    },
    QUESTIONS: {
      DETAIL: (studyroomId: number, contextId: number) =>
        `/study-rooms/${studyroomId}/qna/${contextId}`,
      CREATE: (studyroomId: number) => `/study-rooms/${studyroomId}/qna/new`,
    },
    SETTINGS: '/dashboard/settings',
  },
  BIZ: '#',
} as const;

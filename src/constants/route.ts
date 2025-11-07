export const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/register',
  DASHBOARD: {
    HOME: '/dashboard',
    STUDYROOM: {
      DETAIL: (id: number) => `/studyrooms/${id}/studynotes`,
      CREATE: '/study-rooms/new',
    },
    STUDYNOTE: {
      CREATE: '/dashboard/study-note/new',
      DETAIL: (id: number) => `/dashboard/studynote/${id}`,
      LIST: (id: number) => `/studyrooms/${id}/note`,
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

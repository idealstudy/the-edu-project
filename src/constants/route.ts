export const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/register',
  DASHBOARD: {
    HOME: '/dashboard',
    STUDYROOM: {
      DETAIL: (id: number) => `/studyrooms/${id}/studynotes`,
      CREATE: '/study-rooms/write',
    },
    STUDYNOTE: {
      CREATE: '/dashboard/studynote/write',
      DETAIL: (id: number) => `/dashboard/studynote/${id}`,
      LIST: (id: number) => `/studyrooms/${id}/note`,
    },
    QUESTIONS: {
      DETAIL: (studyroomId: number, contextId: number) =>
        `/dashboard/studyrooms/${studyroomId}/qna/${contextId}`,
      CREATE: (studyroomId: number) =>
        `/dashboard/studyrooms/${studyroomId}/qna/write`,
    },
    SETTINGS: '/dashboard/settings',
  },
  BIZ: '#',
} as const;

/* ─────────────────────────────────────────────────────
 * CORE ROUTES
 * ────────────────────────────────────────────────────*/
const CORE = {
  INDEX: '/',
  LOGIN: '/login',
  SIGNUP: '/register',
  LIST: {
    BASE: '/list',
    TEACHERS: '/list/teachers',
    STUDY_ROOMS: '/list/study-rooms',
  },
  BIZ: '#',
  INVITE: {
    ERROR: (reason: string) => `/invite/error?reason=${reason}`,
    SUCCESS: (studyRoomId: number) =>
      `/invite/success?studyRoomId=${studyRoomId}`,
  },
} as const;

/* ─────────────────────────────────────────────────────
 * DASHBOARD
 * ────────────────────────────────────────────────────*/
type DashboardRole = 'ROLE_TEACHER' | 'ROLE_STUDENT' | 'ROLE_PARENT';

const DASHBOARD = {
  INDEX: '/dashboard',
  TEACHER: '/dashboard/teacher',
  STUDENT: '/dashboard/student',
  PARENT: '/dashboard/parent',
  INQUIRY: '/dashboard/inquiry',

  /** 사용자 역할에 맞는 실제 대시보드 경로를 반환합니다. */
  byRole: (role: DashboardRole): string => {
    switch (role) {
      case 'ROLE_TEACHER':
        return '/dashboard/teacher';
      case 'ROLE_STUDENT':
        return '/dashboard/student';
      case 'ROLE_PARENT':
        return '/dashboard/parent';
    }
  },
} as const;

/* ─────────────────────────────────────────────────────
 * SETTINGS
 * ────────────────────────────────────────────────────*/
const SETTINGS = '/settings';

/* ─────────────────────────────────────────────────────
 * STUDY ROOM
 * ────────────────────────────────────────────────────*/
const ROOM = {
  DETAIL: (id: number) => `/study-rooms/${id}/note`,
  CREATE: '/study-rooms/new',
  EDIT: (id: number) => `/study-rooms/${id}/edit`,
} as const;

/* ─────────────────────────────────────────────────────
 * QUESTIONS
 * ────────────────────────────────────────────────────*/
const QUESTIONS = {
  DETAIL: (studyroomId: number, contextId: number) =>
    `/study-rooms/${studyroomId}/qna/${contextId}`,
  CREATE: (studyroomId: number) => `/study-rooms/${studyroomId}/qna/new`,
  LIST: (studyroomId: number) => `/study-rooms/${studyroomId}/qna`,
} as const;

/* ─────────────────────────────────────────────────────
 * STUDY NOTE
 * ────────────────────────────────────────────────────*/
const NOTE = {
  CREATE: (studyRoomId: number) => `/study-rooms/${studyRoomId}/note/new`,
  EDIT: (studyRoomId: number, noteId: number) =>
    `/study-rooms/${studyRoomId}/note/${noteId}/edit`,
  DETAIL: (studyRoomId: number, noteId: number) =>
    `/study-rooms/${studyRoomId}/note/${noteId}`,
  LIST: (id: number) => `/study-rooms/${id}/note`,
} as const;

/* ─────────────────────────────────────────────────────
 * STUDENT STUDY NOTE
 * ────────────────────────────────────────────────────*/
const STUDENT_NOTE = {
  CREATE: '/study-note/new',
  DETAIL: (noteId: number) => `/study-note/${noteId}`,
} as const;

/* ─────────────────────────────────────────────────────
 * HOMEWORK
 * ────────────────────────────────────────────────────*/
const HOMEWORK = {
  CREATE: (studyRoomId: number) => `/study-rooms/${studyRoomId}/homework/new`,
  DETAIL: (studyRoomId: number, homeworkId: number) =>
    `/study-rooms/${studyRoomId}/homework/${homeworkId}`,
  LIST: (id: number) => `/study-rooms/${id}/homework`,
} as const;

/* ─────────────────────────────────────────────────────
 * PROFILE
 * ────────────────────────────────────────────────────*/
const PROFILE = {
  TEACHER: (teacherId: number) => `/profile/teacher/${teacherId}`,
  STUDENT: (studentId: number) => `/profile/student/${studentId}`,
} as const;

/* ─────────────────────────────────────────────────────
 * STUDY_ROOM_PREVIEW
 * ────────────────────────────────────────────────────*/
const STUDY_ROOM_PREVIEW = {
  DETAIL: (studyRoomId: number, teacherId: number) =>
    `/study-room-preview/${studyRoomId}/${teacherId}`,
} as const;

/* ─────────────────────────────────────────────────────
 * MYPAGE
 * ────────────────────────────────────────────────────*/
const MYPAGE = '/mypage';

/* ─────────────────────────────────────────────────────
 * COMMUNITY
 * ────────────────────────────────────────────────────*/
const PUBLIC_COMMUNITY = {
  BASE: '/community',
  COLUMN: {
    LIST: '/community/column',
    DETAIL: (id: number) => `/community/column/${id}`,
  },
} as const;

const PRIVATE_COMMUNITY = {
  COLUMN: {
    CREATE: '/community/column/new',
    EDIT: (id: number) => `/community/column/${id}/edit`,
  },
} as const;

/* ─────────────────────────────────────────────────────
 * INQUIRY
 * ────────────────────────────────────────────────────*/
const INQUIRY = {
  DETAIL: (id: number) => `/inquiry/${id}`,
  CREATE: (teacherId: number, studyRoomId?: number) =>
    `/inquiry/new?teacherId=${teacherId}${
      studyRoomId ? `&studyRoomId=${studyRoomId}` : ''
    }`,
} as const;

/* ─────────────────────────────────────────────────────
 * OPEN CHALLENGE
 * ────────────────────────────────────────────────────*/
const OPEN_CHALLENGE = {
  LIST: '/open-challenge',
  DETAIL: (id: string | number) => `/open-challenge/${id}`,
  RESULT: (id: string | number) => `/open-challenge/${id}/result`,
} as const;

/* ─────────────────────────────────────────────────────
 * WEAKNESS TREE (약점 트리)
 * ────────────────────────────────────────────────────*/
const TREE = {
  INDEX: '/tree',
} as const;

/* ─────────────────────────────────────────────────────
 * ONBOARDING (학생 온보딩 — 학년·과목·등급·약점 진단)
 * ────────────────────────────────────────────────────*/
const ONBOARDING = {
  INDEX: '/onboarding',
} as const;

/* ─────────────────────────────────────────────────────
 * POINTS (포인트 지갑)
 * ────────────────────────────────────────────────────*/
const POINTS = {
  INDEX: '/points',
} as const;

/* ─────────────────────────────────────────────────────
 * ADMIN
 * ────────────────────────────────────────────────────*/
const ADMIN = {
  COLUMN: {
    LIST: '/admin/column',
    DETAIL: (id: number) => `/admin/column/${id}`,
  },
  OPEN_CHALLENGE: {
    LIST: '/admin/open-challenge',
    NEW: '/admin/open-challenge/new',
    EDIT: (id: string | number) => `/admin/open-challenge/${id}/edit`,
  },
} as const;

/* ─────────────────────────────────────────────────────
 * Export - PUBLIC
 * ────────────────────────────────────────────────────*/
export const PUBLIC = {
  CORE,
  PROFILE,
  STUDY_ROOM_PREVIEW,
  COMMUNITY: PUBLIC_COMMUNITY,
  INQUIRY,
  OPEN_CHALLENGE,
} as const;

/* ─────────────────────────────────────────────────────
 * Export - PRIVATE
 * ────────────────────────────────────────────────────*/
export const PRIVATE = {
  DASHBOARD,
  TREE,
  ONBOARDING,
  POINTS,
  ROOM,
  NOTE,
  STUDENT_NOTE,
  HOMEWORK,
  QUESTIONS,
  COMMUNITY: PRIVATE_COMMUNITY,
  MYPAGE,
  ADMIN,
  SETTINGS,
} as const;

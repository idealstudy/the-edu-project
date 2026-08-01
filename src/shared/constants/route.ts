/* ─────────────────────────────────────────────────────
 * CORE ROUTES
 * ────────────────────────────────────────────────────*/
const CORE = {
  INDEX: '/',
  WELCOME: '/welcome',
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
    CHALLENGE: (token: string) => `/invite/challenge/${token}`,
  },
} as const;

/* ─────────────────────────────────────────────────────
 * COURSE (코스 — 공개 목록·상세 / 수강 차시 뷰)
 * ────────────────────────────────────────────────────*/
const COURSE = {
  LIST: '/courses',
  DETAIL: (id: number) => `/courses/${id}`,
  LEARN: (id: number) => `/courses/${id}/learn`,
} as const;

/* ─────────────────────────────────────────────────────
 * FRIENDS (친구 — 목록·요청·수락)
 * ────────────────────────────────────────────────────*/
const FRIENDS = {
  INDEX: '/friends',
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
  QNA: '/dashboard/qna',
  WRONG_ANSWERS: '/dashboard/student/wrong-answers',
  WRONG_ANSWER_REVIEW: (id: number) => `/dashboard/student/wrong-answers/${id}`,
  UNIT_NOTES: '/dashboard/student/unit-notes',
  UNIT_NOTE_ROOM: (id: number) => `/dashboard/student/unit-notes/${id}`,

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
  // 오픈챌린지 리스트가 사이트 메인('/')으로 승격됨. 상세/결과는 기존 경로 유지.
  LIST: '/',
  DETAIL: (id: string | number) => `/open-challenge/${id}`,
  RESULT: (id: string | number) => `/open-challenge/${id}/result`,
} as const;

/* ─────────────────────────────────────────────────────
 * CHALLENGES (MVP-G 공개 포털 — 오픈챌린지 재노출)
 *  실제 상세 화면은 기존 /open-challenge/:id 를 그대로 재사용한다
 *  (풀이 세션·AI 코치 등 상태가 이미 그 경로에 결선돼 있어 URL만
 *  옮기면 회귀 위험이 큼 — mvp-g frd §7 G4 처리안: "공개 URL은
 *  id 사용 또는 상수 매핑"을 상수 매핑 없이 기존 경로 재사용으로 택함).
 * ────────────────────────────────────────────────────*/
const CHALLENGES = {
  LIST: '/challenges',
  DETAIL: (id: string | number) => `/open-challenge/${id}`,
} as const;

/* ─────────────────────────────────────────────────────
 * TEACHERS (MVP-G 공개 포털 — 대표 멘토 조성진 단독 프로필)
 * ────────────────────────────────────────────────────*/
const TEACHERS = {
  LIST: '/teachers',
  MENTOR_SLUG: 'jo-sungjin',
  DETAIL: '/teachers/jo-sungjin',
} as const;

/* ─────────────────────────────────────────────────────
 * CONSULT (MVP-G 공개 포털 — 비회원 상담 접수 신규 세로 슬라이스)
 * ────────────────────────────────────────────────────*/
const CONSULT = {
  INDEX: '/consult',
  CASE_DETAIL: (id: number) => `/consult/${id}`,
} as const;

/* ─────────────────────────────────────────────────────
 * BOARD (MVP-G 공개 포털 — 칼럼/매거진, 기존 column_article 재노출)
 * ────────────────────────────────────────────────────*/
const BOARD = {
  LIST: '/board',
  DETAIL: (id: number) => `/board/${id}`,
} as const;

/* ─────────────────────────────────────────────────────
 * LEARNING (내 학습 허브 — 약점 트리·포인트·내 문제)
 * ────────────────────────────────────────────────────*/
const LEARNING = {
  INDEX: '/learning',
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
 * PARENT (학부모 — 자녀 목록 대시보드 · 자녀 학습 리포트)
 * ────────────────────────────────────────────────────*/
const PARENT = {
  INDEX: '/parent',
  CHILD_REPORT: (childId: number) => `/parent/children/${childId}`,
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
  COURSE,
  CHALLENGES,
  TEACHERS,
  CONSULT,
  BOARD,
} as const;

/* ─────────────────────────────────────────────────────
 * Export - PRIVATE
 * ────────────────────────────────────────────────────*/
export const PRIVATE = {
  DASHBOARD,
  LEARNING,
  TREE,
  ONBOARDING,
  POINTS,
  PARENT,
  ROOM,
  NOTE,
  STUDENT_NOTE,
  HOMEWORK,
  QUESTIONS,
  COMMUNITY: PRIVATE_COMMUNITY,
  MYPAGE,
  ADMIN,
  SETTINGS,
  COURSE,
  FRIENDS,
} as const;

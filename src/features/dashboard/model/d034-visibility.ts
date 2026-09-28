// D-034: 기능·데이터·라우트는 유지하고 학생 화면의 비코어 진입점만 렌더에서 숨긴다.
export const D034_HIDDEN = {
  'student.sidebar.exam-hall': true,
  'student.sidebar.friends': true,
  'student.sidebar.points': true,
  'student.sidebar.weakness-tree': true,
  'student.dashboard.exam-hall-entry': true,
  'student.dashboard.open-challenge-list-entry': true,
  'student.dashboard.todo-point-rewards': true,
  'student.dashboard.todo-exam-hall-entry': true,
  'student.header.points': true,
  'student.mypage.open-challenge-entry': true,
  'student.results.point-rewards': true,
} as const;

// D-034: 학생에게 숨기는 제품명은 기능 의미를 보존하는 일반 명칭으로 치환한다.
export const D034_STUDENT_COPY = {
  examHall: '시험 과제',
  openChallenge: '추천 문제',
} as const;

export type D034HiddenSurface = keyof typeof D034_HIDDEN;

export const isD034HiddenForRole = (
  role: string | null | undefined,
  surface: D034HiddenSurface
) => role === 'ROLE_STUDENT' && D034_HIDDEN[surface];

/**
 * MVP-G 대시보드 v3 — 응시장·성장·오늘 할 일 타입 정의 (값 상수 없음)
 *
 * ⚠️ 아래 "백엔드 계약 필요" 목록은 2026-07-23 시점 상태이고 **지금은 사실이 아니다**(2026-08-10 정정).
 *    그 뒤로 대부분 실제 API 가 만들어졌다. 특히 성장은 서버가 완성돼 있다.
 *    student_growth 표(V58), 시듦 단계 계산(StudentGrowth.stageAt), GET /api/student/growth.
 *    없는 것은 서버가 아니라 **그것을 그리는 화면**이다(2026-08-07 커밋 8852e8867 에서 삭제됨).
 *    낡은 주석을 믿고 "서버부터 만들어야 한다"고 판단하면 이미 있는 것을 다시 만들게 된다.
 *    상태는 이 주석이 아니라 코드로 확인하라.
 *
 *  (2026-07-23 당시 기록)
 *  - 응시장(예상 등급·응시 D-day) — 오픈챌린지 결과 집계 + 등급컷 매핑 필요
 *  - 성장(온도나무 레벨·xp·스트릭) — 게이미피케이션 도메인 신규
 *  - 오늘 할 일(선생님 과제/응시장/오픈챌린지 통합 피드) — 통합 피드 API 신규
 *  - 교사 배정/결과판, 학부모 주간 카드 — 위 도메인에 종속
 *
 * 회장 지시(2026-07-23): 실측 없는 값을 화면에 숫자로 렌더하지 않는다.
 * 이 파일은 타입 계약만 남기고, 값 상수(MOCK_*)는 전부 제거했다.
 * 계약이 생기면 이 타입에 맞는 실 쿼리 훅을 만들어 컴포넌트의 `summary` prop에
 * 실값을 채우면 된다 — 그 전까지 컴포넌트는 `summary`를 안 받고 "준비 중" 빈 상태만 그린다.
 * 근거: /Users/sj/sj_code_master/d-edu/prototypes/mvp-g-대시보드-v3-fable.html
 *      /Users/sj/sj_code_master/d-edu/prototypes/mvp-g-교사학부모-플로우-v3-fable.html
 */

export type TreeStage = 0 | 1 | 2 | '3-dormant';

export interface GrowthSummary {
  level: number;
  daysGrown: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  stage: TreeStage;
  hasShield?: boolean;
}

export interface ExamHallSummary {
  examTitle: string;
  examDDay: number;
  hasAttempts: boolean;
  predictedGrade?: number;
  deltaMessage?: string;
  confidenceNote: string;
  ctaHref: string;
  ctaLabel: string;
  ctaSubLabel?: string;
}

export type TodoSource = 'teacher' | 'exam-hall' | 'open-challenge' | 'me';

export interface TodoItem {
  id: string;
  title: string;
  source: TodoSource;
  meta: string;
  rewardPoint: number;
  done: boolean;
}

export interface TodaySummary {
  dateLabel: string;
  items: TodoItem[];
}

export const TODO_SOURCE_LABEL: Record<TodoSource, string> = {
  teacher: '선생님',
  'exam-hall': '응시장',
  'open-challenge': '오픈챌린지',
  me: '내가',
};

/**
 * MVP-G v4 — 회고 루프 (2026-07-22 fable v4 프로토타입)
 * ⛔ 백엔드 계약 필요: 회고 저장 API·주간 AI 요약 배치가 아직 없다.
 * 타입 계약만 남기고 값 상수는 만들지 않는다(회장 지시 2026-07-23 원칙 승계).
 *
 * ⛔ 회수 필요: 매일 회고는 v4 프로토타입에 부담 2안이 나란히 제시돼 있다
 *  (㉠ 30초·자동채움+탭 vs ㉡ 서술형 5칸 전부 키보드). 어느 안을 기본값으로 확정할지 회장 결정 필요.
 *  같은 이유로 "학생이 직접 할 일 꽂기"도 2안(㉮ AI 추천칩 vs ㉯ 완전 자유입력) 미결.
 *  본 구현은 UI 골격만 두고 실제 폼은 백엔드 계약 이후로 미룬다.
 */
export interface DailyRetroSummary {
  hasWrittenToday: boolean;
  lastRetroDateLabel?: string;
}

export interface WeeklyRetroSummary {
  rangeLabel: string;
  aiSummary?: string;
  evidenceTags?: string[];
}

export interface TeacherAiCommentSummary {
  weekRangeLabel: string;
  studentCount: number;
  comments?: { studentName: string; comment: string; evidenceTags: string[] }[];
}

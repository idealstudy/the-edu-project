/**
 * MVP-G 대시보드 v3 — 응시장·성장·오늘 할 일 타입 정의 (값 상수 없음)
 *
 * ⛔ 백엔드 계약 필요: 아래 타입에 대응하는 실제 API가 아직 없다.
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

export type TodoSource = 'teacher' | 'exam-hall' | 'open-challenge';

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
};

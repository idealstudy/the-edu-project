import type {
  OnboardingElective,
  OnboardingGrade,
  OnboardingSelfGrade,
} from '@/entities/onboarding';

/* ─────────────────────────────────────────────────────
 * 온보딩 스텝 정의 — 진행 인디케이터의 기준
 *  필수 4 + 선택 진단(점선) + 체험/공개 화면.
 * ────────────────────────────────────────────────────*/
export type OnboardingStep =
  | 'grade' // 1 학년
  | 'elective' // 2 선택과목
  | 'selfGrade' // 3 본인 등급
  | 'weakUnits' // 4 약점 대단원
  | 'diagnosis' // 선택 · 모의고사 한방진단(skip 가능)
  | 'experience' // 1문제 체험
  | 'reveal'; // 약점 트리 공개

/** 진행 바에 노출되는 순서 (체험·공개는 진행 바에선 "done"으로 묶음) */
export const STEP_SEQUENCE: OnboardingStep[] = [
  'grade',
  'elective',
  'selfGrade',
  'weakUnits',
  'diagnosis',
  'experience',
  'reveal',
];

/** 필수 기본정보 4스텝 (진행 인디케이터 막대 4개) */
export const CORE_STEP_COUNT = 4;

/* ─────────────────────────────────────────────────────
 * 학년 옵션 (RadioCard)
 * ────────────────────────────────────────────────────*/
export const GRADE_OPTIONS: {
  value: OnboardingGrade;
  label: string;
  meta: string;
}[] = [
  { value: 'HIGH_1', label: '고1', meta: '공통수학 1·2' },
  { value: 'HIGH_2', label: '고2', meta: '수학Ⅰ·Ⅱ + 선택과목 시작' },
  { value: 'HIGH_3', label: '고3', meta: '수능·6·9모 대비' },
  { value: 'N_RETAKE', label: 'N수·검정고시', meta: '전 범위' },
];

/* ─────────────────────────────────────────────────────
 * 선택과목 옵션 (RadioCard) — 공통은 고정 안내(선택 불가)
 * ────────────────────────────────────────────────────*/
export const ELECTIVE_OPTIONS: {
  value: OnboardingElective;
  label: string;
  meta: string;
}[] = [
  { value: 'CALCULUS', label: '미적분', meta: '수열의 극한 · 미분법 · 적분법' },
  { value: 'STATISTICS', label: '확률과 통계', meta: '경우의 수 · 확률 · 통계' },
  { value: 'GEOMETRY', label: '기하', meta: '이차곡선 · 평면벡터 · 공간도형' },
];

/* ─────────────────────────────────────────────────────
 * 본인 등급 옵션 (1~9 + 잘 모름)
 * ────────────────────────────────────────────────────*/
export const GRADE_NUMBERS: OnboardingSelfGrade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const SELF_GRADE_UNKNOWN: OnboardingSelfGrade = 'UNKNOWN';

/* ─────────────────────────────────────────────────────
 * 모의진단(체험 코치) 칩 — 정답 미제공 톤
 * ────────────────────────────────────────────────────*/
export const COACH_CHIPS = [
  '시작을 못하겠어요',
  '개념 다시',
  '이거 맞아요?',
  '다음 뭐 해요?',
];

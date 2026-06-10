import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 약점 트리 과목 Domain
 * ────────────────────────────────────────────────────*/
const TreeSubjectSchema = z.enum(['MATH', 'KOREAN', 'ENGLISH', 'SCIENCE']);

/* ─────────────────────────────────────────────────────
 * 정복도 강도 4단계 Domain
 *  - untested: 미진단 (회색)
 *  - weak: 약점 (옅은 오렌지)
 *  - progress: 진행 (중간 오렌지)
 *  - mastered: 정복 (진한 오렌지)
 * ────────────────────────────────────────────────────*/
const TreeIntensitySchema = z.enum([
  'untested',
  'weak',
  'progress',
  'mastered',
]);

/* ─────────────────────────────────────────────────────
 * 약점 트리 노드 Domain
 *  - masteryScore: 자력 정답 기반 정복도(0~100)
 *  - diagnosedScore: 모의고사 자기신고 진단 점수(0~100, 없으면 null)
 *  - attemptCount / correctCount: 정직 숫자(반복 막힘 판정 근거)
 * ────────────────────────────────────────────────────*/
const TreeNodeSchema = z.object({
  nodeId: z.string(),
  parentId: z.string().nullable(),
  subject: TreeSubjectSchema,
  unit: z.string(),
  displayName: z.string(),
  depth: z.number(),
  masteryScore: z.number(),
  diagnosedScore: z.number().nullable(),
  attemptCount: z.number(),
  correctCount: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 노드별 사용자 진척 상태 Domain (정복도 + 파생 플래그)
 * ────────────────────────────────────────────────────*/
const UserNodeStatusSchema = z.object({
  masteryScore: z.number(),
  diagnosedScore: z.number().nullable(),
  attemptCount: z.number(),
  correctCount: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 트리 전체 진척 요약 Domain
 * ────────────────────────────────────────────────────*/
const TreeMasterySchema = z.object({
  total: z.number(),
  mastered: z.number(),
  inProgress: z.number(),
  weak: z.number(),
  untested: z.number(),
  averageScore: z.number(),
});

/* ─────────────────────────────────────────────────────
 * 정복도 → 4단계 강도 매핑 헬퍼
 *  - 0: 미진단(untested)
 *  - 1~49: 약점(weak)
 *  - 50~79: 진행(progress)
 *  - 80~100: 정복(mastered)
 * ────────────────────────────────────────────────────*/
const WEAK_THRESHOLD = 50;
const PROGRESS_THRESHOLD = 80;

const toIntensity = (masteryScore: number): z.infer<typeof TreeIntensitySchema> => {
  if (masteryScore <= 0) return 'untested';
  if (masteryScore < WEAK_THRESHOLD) return 'weak';
  if (masteryScore < PROGRESS_THRESHOLD) return 'progress';
  return 'mastered';
};

/* ─────────────────────────────────────────────────────
 * 반복 막힘 판정 헬퍼
 *  - 충분히 시도했는데(≥3회) 자력 정답률이 낮으면(<35%) 막힘으로 본다.
 *  - 노드 색은 바꾸지 않고 ⚠ 마커만 띄우기 위한 플래그.
 * ────────────────────────────────────────────────────*/
const STUCK_MIN_ATTEMPTS = 3;
const STUCK_MAX_CORRECT_RATE = 0.35;

const isStuck = (attemptCount: number, correctCount: number): boolean => {
  if (attemptCount < STUCK_MIN_ATTEMPTS) return false;
  return correctCount / attemptCount < STUCK_MAX_CORRECT_RATE;
};

/* ─────────────────────────────────────────────────────
 * 모의(자기신고) 우세 여부 헬퍼
 *  - 자력 풀이 이력이 없고(미진단) 진단 점수만 있으면 "모의" 태그를 띄운다.
 * ────────────────────────────────────────────────────*/
const isDiagnosedOnly = (
  masteryScore: number,
  diagnosedScore: number | null
): boolean => masteryScore <= 0 && diagnosedScore !== null && diagnosedScore > 0;

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const domain = {
  subject: TreeSubjectSchema,
  intensity: TreeIntensitySchema,
  node: TreeNodeSchema,
  userNodeStatus: UserNodeStatusSchema,
  mastery: TreeMasterySchema,
};

export const helpers = {
  toIntensity,
  isStuck,
  isDiagnosedOnly,
};

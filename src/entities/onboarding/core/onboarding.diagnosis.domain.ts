import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 학년 Domain — 출제 범위 추천에 사용 (추천 PR5에 넘김)
 * ────────────────────────────────────────────────────*/
const GradeSchema = z.enum(['HIGH_1', 'HIGH_2', 'HIGH_3', 'N_RETAKE']);

/* ─────────────────────────────────────────────────────
 * 수학 선택과목 Domain (공통·수Ⅰ·수Ⅱ는 기본 포함, 1개 선택)
 * ────────────────────────────────────────────────────*/
const ElectiveSchema = z.enum(['CALCULUS', 'STATISTICS', 'GEOMETRY']);

/* ─────────────────────────────────────────────────────
 * 본인 등급 Domain — 1~9 또는 "잘 모름"(비공개, 추천 정확도용)
 *  UNKNOWN은 진단으로 추정.
 * ────────────────────────────────────────────────────*/
const SelfGradeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal('UNKNOWN'),
]);

/* ─────────────────────────────────────────────────────
 * 모의고사 한방진단 항목 Domain
 *  - treeNodeId: 대단원 트리 노드 ID
 *  - weak: true면 약점(틀림/약함), false면 강함(맞힘)
 * ────────────────────────────────────────────────────*/
const DiagnosisItemSchema = z.object({
  treeNodeId: z.string(),
  weak: z.boolean(),
});

/* ─────────────────────────────────────────────────────
 * 온보딩 입력값 전체 Domain — 로컬 state로 모으는 값
 *  저장 API가 없으면 state만 유지하고, 추천(PR5) 연동은 후속.
 * ────────────────────────────────────────────────────*/
const OnboardingInputSchema = z.object({
  grade: GradeSchema.nullable(),
  elective: ElectiveSchema.nullable(),
  selfGrade: SelfGradeSchema.nullable(),
  weakNodeIds: z.array(z.string()),
});

export const diagnosisDomain = {
  grade: GradeSchema,
  elective: ElectiveSchema,
  selfGrade: SelfGradeSchema,
  item: DiagnosisItemSchema,
  input: OnboardingInputSchema,
};

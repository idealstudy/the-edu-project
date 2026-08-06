import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 공통 스키마
 * ────────────────────────────────────────────────────*/
const IdSchema = z.union([z.string(), z.number()]).transform(String);
const NullableIdSchema = z
  .union([z.string(), z.number()])
  .nullable()
  .optional()
  .transform((v) => (v === null || v === undefined ? null : String(v)));

const TreeSubjectDtoSchema = z
  .string()
  .trim()
  .min(1)
  .optional()
  .default('OTHER');

/* ─────────────────────────────────────────────────────
 * 약점 트리 노드 DTO (백엔드 TreeNodeResponse)
 *  - masteryScore: 자력 정복도(0~100)
 *  - diagnosedScore: 모의 자기신고 점수(백엔드 미제공 가능 → optional)
 * ────────────────────────────────────────────────────*/
const TreeNodeDtoSchema = z.object({
  nodeId: IdSchema,
  parentId: NullableIdSchema,
  subject: TreeSubjectDtoSchema,
  unit: z.string().optional().default(''),
  displayName: z.string().optional().default('단원'),
  depth: z.number().optional().default(1),
  masteryScore: z.number().optional().default(0),
  diagnosedScore: z.number().nullable().optional().default(null),
  attemptCount: z.number().optional().default(0),
  correctCount: z.number().optional().default(0),
  unitNotePageCount: z.number().optional().default(0),
});

/* ─────────────────────────────────────────────────────
 * 내 약점 트리 응답 DTO ({ nodes: [...] })
 * ────────────────────────────────────────────────────*/
// nodes는 required — .optional().default([])를 두면 unwrapEnvelope의
// z.union([dataSchema, envelopeSchema])에서 envelope({status,message,data})이
// dataSchema에 먼저 매칭되어 {nodes:[]}로 반환되고 실제 data를 못 꺼낸다.
const TreeResponseDtoSchema = z.object({
  nodes: z.array(TreeNodeDtoSchema),
});

/* ─────────────────────────────────────────────────────
 * 단원(노드) 챌린지 목록 DTO (백엔드 ChallengeListItemResponse)
 * ────────────────────────────────────────────────────*/
const NodeChallengeDtoSchema = z.object({
  challengeId: IdSchema,
  subject: TreeSubjectDtoSchema,
  difficulty: z
    .union([
      z.enum(['TOP', 'HIGH', 'MID', 'LOW']),
      z.enum(['highest', 'high', 'middle', 'low']),
      z.string(),
    ])
    .optional()
    .default('middle'),
  wrongAnswerRate: z.number().nullable().optional().default(0),
  sourceText: z.string().optional().default('출처 정보'),
  questionText: z.string().nullable().optional(),
  questionImageUrl: z.string().nullable().optional().default(null),
  participantCount: z.number().optional().default(0),
  passRate: z.number().nullable().optional().default(null),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  node: TreeNodeDtoSchema,
  tree: TreeResponseDtoSchema,
  nodeChallenge: NodeChallengeDtoSchema,
  nodeChallenges: z.array(NodeChallengeDtoSchema),
};

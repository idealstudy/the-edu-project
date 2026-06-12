import { domain } from '@/entities/tree/core';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Domain 추론 Type
 * ────────────────────────────────────────────────────*/
export type TreeSubject = z.infer<typeof domain.subject>;
export type TreeIntensity = z.infer<typeof domain.intensity>;
export type TreeNode = z.infer<typeof domain.node>;
export type UserNodeStatus = z.infer<typeof domain.userNodeStatus>;
export type TreeMastery = z.infer<typeof domain.mastery>;

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 화면이 바로 쓰는 노드 (파생 플래그 포함)
 * ────────────────────────────────────────────────────*/
export type TreeNodeView = TreeNode & {
  /** 정복도 → 4단계 강도 (untested | weak | progress | mastered) */
  intensity: TreeIntensity;
  /** 반복 막힘 ⚠ 여부 (노드 색은 안 바뀜) */
  stuck: boolean;
  /** 자력 이력 없이 모의(자기신고) 점수만 있는지 → "모의" 태그 */
  diagnosedOnly: boolean;
};

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 과목별로 묶은 트리 섹션
 * ────────────────────────────────────────────────────*/
export type TreeSubjectGroup = {
  subject: TreeSubject;
  nodes: TreeNodeView[];
};

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 트리 전체 (섹션 + 진척 요약)
 * ────────────────────────────────────────────────────*/
export type TreeView = {
  groups: TreeSubjectGroup[];
  mastery: TreeMastery;
};

/* ─────────────────────────────────────────────────────
 * UI-ready Type — 단원 챌린지 카드
 * ────────────────────────────────────────────────────*/
export type NodeChallenge = {
  challengeId: string;
  subject: TreeSubject;
  difficulty: 'TOP' | 'HIGH' | 'MID' | 'LOW';
  wrongAnswerRate: number;
  sourceText: string;
  questionText: string;
  questionImageUrl: string | null;
  participantCount: number;
  passRate: number | null;
};

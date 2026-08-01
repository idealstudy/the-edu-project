import { domain, helpers } from '@/entities/tree/core';
import {
  type NodeChallenge,
  type TreeMastery,
  type TreeNodeView,
  type TreeSubject,
  type TreeSubjectGroup,
  type TreeView,
} from '@/entities/tree/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './tree.dto';

/* ─────────────────────────────────────────────────────
 * 변환 상수 / Helper
 * ────────────────────────────────────────────────────*/
const SUBJECT_ORDER: TreeSubject[] = [
  'MIDDLE_MATH',
  'COMMON_MATH_1',
  'COMMON_MATH_2',
  'MATH_1',
  'MATH_2',
  'CALCULUS',
  'PROBABILITY_STATISTICS',
  'GEOMETRY',
  'OTHER',
];

const toSubject = (subject: string): TreeSubject => {
  switch (subject.toUpperCase()) {
    case 'MIDDLE_MATH':
      return 'MIDDLE_MATH';
    case 'COMMON_MATH_1':
      return 'COMMON_MATH_1';
    case 'COMMON_MATH_2':
      return 'COMMON_MATH_2';
    case 'MATH_1':
      return 'MATH_1';
    case 'MATH_2':
      return 'MATH_2';
    case 'CALCULUS':
      return 'CALCULUS';
    case 'PROBABILITY_STATISTICS':
      return 'PROBABILITY_STATISTICS';
    case 'GEOMETRY':
      return 'GEOMETRY';
    default:
      return 'OTHER';
  }
};

const toDifficulty = (difficulty: string): NodeChallenge['difficulty'] => {
  switch (difficulty.toUpperCase()) {
    case 'TOP':
    case 'HIGHEST':
    case '최상':
      return 'TOP';
    case 'HIGH':
    case '상':
      return 'HIGH';
    case 'LOW':
    case '하':
      return 'LOW';
    case 'MID':
    case 'MIDDLE':
    case '중':
    default:
      return 'MID';
  }
};

/* ─────────────────────────────────────────────────────
 * DTO → UI-ready 변환
 * ────────────────────────────────────────────────────*/
const toNodeView = (raw: unknown): TreeNodeView => {
  const node = dto.node.parse(raw);
  const parsed = domain.node.parse({
    ...node,
    subject: toSubject(node.subject),
  });

  return {
    ...parsed,
    intensity: helpers.toIntensity(parsed.masteryScore),
    stuck: helpers.isStuck(parsed.attemptCount, parsed.correctCount),
    diagnosedOnly: helpers.isDiagnosedOnly(
      parsed.masteryScore,
      parsed.diagnosedScore
    ),
  };
};

const summarize = (nodes: TreeNodeView[]): TreeMastery => {
  const total = nodes.length;
  const mastered = nodes.filter((n) => n.intensity === 'mastered').length;
  const inProgress = nodes.filter((n) => n.intensity === 'progress').length;
  const weak = nodes.filter((n) => n.intensity === 'weak').length;
  const untested = nodes.filter((n) => n.intensity === 'untested').length;
  const averageScore =
    total === 0
      ? 0
      : Math.round(nodes.reduce((acc, n) => acc + n.masteryScore, 0) / total);

  return { total, mastered, inProgress, weak, untested, averageScore };
};

const groupBySubject = (nodes: TreeNodeView[]): TreeSubjectGroup[] => {
  const groups = SUBJECT_ORDER.map((subject) => ({
    subject,
    nodes: nodes.filter((n) => n.subject === subject),
  })).filter((group) => group.nodes.length > 0);

  return groups;
};

const toNodeChallenge = (raw: unknown): NodeChallenge => {
  const parsed = dto.nodeChallenge.parse(raw);

  return {
    challengeId: parsed.challengeId,
    subject: toSubject(parsed.subject),
    difficulty: toDifficulty(parsed.difficulty),
    wrongAnswerRate: parsed.wrongAnswerRate ?? 0,
    sourceText: parsed.sourceText,
    questionText:
      parsed.questionText ?? '문제 이미지를 보고 답을 선택해 주세요.',
    questionImageUrl: parsed.questionImageUrl,
    participantCount: parsed.participantCount,
    passRate: parsed.passRate,
  };
};

/* ─────────────────────────────────────────────────────
 * [READ] 내 약점 트리 조회 (노드 + 정복도)
 *  GET /api/common/tree
 * ────────────────────────────────────────────────────*/
const getMyTree = async (): Promise<TreeView> => {
  const response = await api.private.get('/common/tree');
  const data = unwrapEnvelope(response, dto.tree);
  const nodes = data.nodes
    .map(toNodeView)
    // 대단원(루트 depth) 위주로 보여 주되, 모든 노드를 과목 그리드에 노출.
    .sort((a, b) => b.masteryScore - a.masteryScore);

  return {
    groups: groupBySubject(nodes),
    mastery: summarize(nodes),
  };
};

/* ─────────────────────────────────────────────────────
 * [READ] 특정 단원(노드)의 챌린지 목록 조회
 *  GET /api/common/tree/{nodeId}/challenges
 * ────────────────────────────────────────────────────*/
const getNodeChallenges = async (nodeId: string): Promise<NodeChallenge[]> => {
  const response = await api.private.get(`/common/tree/${nodeId}/challenges`);
  const list = unwrapEnvelope(response, dto.nodeChallenges);
  return list.map(toNodeChallenge);
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  getMyTree,
  getNodeChallenges,
};

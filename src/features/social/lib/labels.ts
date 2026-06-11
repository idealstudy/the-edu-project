import {
  type FriendshipState,
  type InviteStatus,
} from '@/entities/social';

/* ─────────────────────────────────────────────────────
 * 과목 / 난이도 라벨 (도전장 미리보기 등 표시용)
 *  백엔드 enum 이름(MATH/TOP …)을 한국어로 변환.
 * ────────────────────────────────────────────────────*/
const SUBJECT_LABELS: Record<string, string> = {
  MATH: '수학',
  KOREAN: '국어',
  ENGLISH: '영어',
  SCIENCE: '탐구',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  TOP: '최상',
  HIGH: '상',
  MID: '중',
  LOW: '하',
};

export const subjectLabel = (subject: string | null): string => {
  if (!subject) return '기타';
  return SUBJECT_LABELS[subject.toUpperCase()] ?? subject;
};

export const difficultyLabel = (difficulty: string | null): string | null => {
  if (!difficulty) return null;
  return DIFFICULTY_LABELS[difficulty.toUpperCase()] ?? difficulty;
};

/* ─────────────────────────────────────────────────────
 * 친구 상태 / 도전장 상태 라벨
 * ────────────────────────────────────────────────────*/
export const friendStateLabel = (state: FriendshipState): string =>
  state === 'ACCEPTED' ? '친구' : '대기 중';

export const inviteStatusLabel = (status: InviteStatus): string => {
  switch (status) {
    case 'OPEN':
      return '대기 중';
    case 'ACCEPTED':
      return '수락됨';
    case 'COMPLETED':
      return '완료';
    default:
      return status;
  }
};

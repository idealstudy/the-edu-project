import { type SolutionItem } from '../components/result/solution-list';

export type ChallengeResultMock = {
  isCorrect: boolean;
  correctAnswer: string;
  passRate: number;
  participantCount: number;
};

export type NextChallengeMock = {
  id: string;
  subject: string;
  title: string;
  passRate: number;
  participantCount: number;
  questionImageUrl: string | null;
};

export const MOCK_RESULT: ChallengeResultMock = {
  isCorrect: true,
  correctAnswer: '③',
  passRate: 37,
  participantCount: 128,
};

export const MOCK_SOLUTIONS: SolutionItem[] = [
  {
    id: '1',
    nickname: '수학잘하고싶다',
    subject: '고등 수학 (상)',
    content:
      'f(x) = 2x + 1 에서 x = 3 을 대입하면\nf(3) = 2 × 3 + 1\n     = 6 + 1\n     = 7',
    solutionType: 'TEXT',
    drawingImageUrl: null,
    recommendCount: 12,
    isBest: true,
    isRecommendedByMe: false,
    isCorrect: true,
    authorNickname: '수학고수',
    isMine: false,
  },
  {
    id: '2',
    nickname: '손글씨풀이러',
    subject: '고등 수학 (상)',
    content: '',
    solutionType: 'DRAWING',
    drawingImageUrl: 'https://placehold.co/760x440/png?text=Handwriting',
    recommendCount: 9,
    isBest: false,
    isRecommendedByMe: false,
    isCorrect: true,
    authorNickname: '풀이장인',
    isMine: false,
  },
  {
    id: '3',
    nickname: '함수마스터',
    subject: '고등 수학 (상)',
    content: 'f(x) = 2x + 1\nx = 3 을 대입하면  f(3) = 2 · 3 + 1 = 7',
    solutionType: 'TEXT',
    drawingImageUrl: null,
    recommendCount: 5,
    isBest: false,
    isRecommendedByMe: false,
    isCorrect: false,
    authorNickname: '꾸준한학생',
    isMine: false,
  },
  {
    id: '4',
    nickname: '열공중',
    subject: '고등 수학 (상)',
    content: '2/3 ÷ 3/5 = 2/3 × 5/3 = 10/9',
    solutionType: 'TEXT',
    drawingImageUrl: null,
    recommendCount: 3,
    isBest: false,
    isRecommendedByMe: false,
    isCorrect: true,
    authorNickname: '논리왕',
    isMine: false,
  },
];

export const MOCK_NEXT_CHALLENGE: NextChallengeMock = {
  id: '2',
  subject: '수학 · 함수',
  title: '함수의 극한, 이 조건에서 수렴할까?',
  passRate: 31,
  participantCount: 1056,
  questionImageUrl: null,
};

import Link from 'next/link';

import { ChallengeShareButton } from '@/features/social';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { Flame, User } from 'lucide-react';

export type ChallengeSubject = 'MATH' | 'KOREAN' | 'ENGLISH' | 'SCIENCE';

export type ChallengeCardData = {
  id: string;
  subject: ChallengeSubject;
  difficulty: 'TOP' | 'HIGH' | 'MID' | 'LOW';
  title: string;
  sourceText: string;
  questionImageUrl: string | null;
  passRate: number | null;
  participantCount: number;
  /** 단원/유형 — 티저 주인공(없으면 sourceText 끝 segment에서 유도) */
  topic?: string;
  /** 오답률 — 정답률(100-오답률) 도발 스탯(없으면 passRate→난이도 폴백) */
  wrongAnswerRate?: number;
};

type SubjectConfig = {
  label: string;
  tagClass: string;
  bgClass: string;
  borderClass: string;
};

// B+A: 브랜드색은 오렌지 하나. 과목은 중립 그레이 칩(임의색 금지),
// 난이도는 오렌지 강도 한 축으로 표현(트리 시그니처와 일관).
const SUBJECT_CONFIG: Record<ChallengeSubject, SubjectConfig> = {
  MATH: {
    label: '수학',
    tagClass: 'bg-gray-11 text-white',
    bgClass: 'bg-orange-1',
    borderClass: 'border-line-line1',
  },
  KOREAN: {
    label: '국어',
    tagClass: 'bg-gray-11 text-white',
    bgClass: 'bg-gray-1',
    borderClass: 'border-line-line1',
  },
  ENGLISH: {
    label: '영어',
    tagClass: 'bg-gray-11 text-white',
    bgClass: 'bg-gray-1',
    borderClass: 'border-line-line1',
  },
  SCIENCE: {
    label: '탐구',
    tagClass: 'bg-gray-11 text-white',
    bgClass: 'bg-gray-1',
    borderClass: 'border-line-line1',
  },
};

const DIFFICULTY_CONFIG = {
  TOP: {
    label: '최상',
    tagClass: 'bg-orange-9 text-white',
    cardClass: 'border-orange-7',
  },
  HIGH: {
    label: '상',
    tagClass: 'bg-orange-7 text-white',
    cardClass: 'border-orange-4',
  },
  MID: {
    label: '중',
    tagClass: 'bg-orange-4 text-gray-11',
    cardClass: '',
  },
  LOW: {
    label: '하',
    tagClass: 'bg-gray-3 text-gray-11',
    cardClass: '',
  },
} as const;

const PASS_RATE_DENOMINATOR = 10;

// 제목 앞머리의 "16." / "16)" 패턴 → 문항 번호로 추출.
const QUESTION_NUMBER_PREFIX = /^\s*(\d{1,3})\s*[.)]\s*/;

export const ChallengeCard = ({
  challenge,
  isLoggedIn = false,
}: {
  challenge: ChallengeCardData;
  /** 로그인 유저에게만 카드에서 바로 도전장을 보낼 수 있게 공유 버튼을 노출한다. */
  isLoggedIn?: boolean;
}) => {
  const config = SUBJECT_CONFIG[challenge.subject];
  const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty];
  const correctCountOutOf10 =
    challenge.passRate !== null
      ? Math.round((challenge.passRate / 100) * PASS_RATE_DENOMINATOR)
      : null;

  // 출처 배지: "<출처> · N번" (번호는 제목 앞머리에서 파싱, 없으면 출처만).
  // 번호만 보조 표기로 쓰고, 제목(수식·문제 내용)은 티저에 노출하지 않는다.
  const numberMatch = challenge.title.match(QUESTION_NUMBER_PREFIX);
  const questionNumber = numberMatch ? numberMatch[1] : null;
  const sourceBadge = questionNumber
    ? `${challenge.sourceText} · ${questionNumber}번`
    : challenge.sourceText;

  // 단원/유형: card data의 topic 우선, 없으면 출처 끝 segment("… · <단원>")에서 유도.
  const topic =
    challenge.topic ??
    challenge.sourceText.split('·').pop()?.trim() ??
    challenge.sourceText;

  // 정답률(도발 스탯): 오답률 있으면 100-오답률, 없으면 통과율, 둘 다 없으면 난이도로 대체.
  const correctRate =
    challenge.wrongAnswerRate != null
      ? 100 - challenge.wrongAnswerRate
      : challenge.passRate;
  const isHardStat = correctRate !== null && correctRate < 40;

  return (
    <Link
      href={PUBLIC.OPEN_CHALLENGE.DETAIL(challenge.id)}
      data-testid="open-challenge-card"
      className={cn(
        'group focus-visible:ring-key-color-primary flex min-h-full flex-col overflow-hidden rounded-xl border transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none',
        difficultyConfig.cardClass || config.borderClass
      )}
      aria-label={`${challenge.title} 도전하기`}
    >
      {/* 썸네일은 항상 '퀴즈 티저' — 원본 문제(이미지)는 풀이 화면에서만 노출한다. */}
      <div className="relative min-h-[200px]">
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-semibold',
              config.tagClass
            )}
          >
            {config.label}
          </span>
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-semibold',
              difficultyConfig.tagClass
            )}
          >
            {difficultyConfig.label}
          </span>
        </div>
        {isLoggedIn && (
          <div
            className="absolute top-3 right-3 z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ChallengeShareButton
              challengeId={Number(challenge.id)}
              variant="secondary"
              size="xsmall"
              label="도전장"
            />
          </div>
        )}
        {(
          // '퀴즈 티저' — 문제 내용·수식은 숨기고 단원/난이도/정답률·출처로 궁금증 유발.
          <div className="from-orange-1 to-orange-3 relative flex min-h-[200px] w-full flex-col overflow-hidden bg-gradient-to-br px-5 pt-12 pb-5">
            {/* 배경: 정답률을 큰 숫자로 — 수식 대신 도발 스탯 */}
            {correctRate !== null && (
              <span className="text-orange-4/40 pointer-events-none absolute -right-2 -bottom-6 text-[96px] leading-none font-black tabular-nums select-none">
                {correctRate}
                <span className="text-[40px]">%</span>
              </span>
            )}

            {/* 단원/유형 — 주인공 */}
            <p className="text-text-main relative z-10 line-clamp-2 text-2xl leading-tight font-extrabold text-balance">
              {topic}
            </p>

            <div className="relative z-10 mt-auto flex flex-col gap-1.5 pt-3">
              {/* 정답률 도발 (없으면 난이도로 대체) */}
              {correctRate !== null ? (
                <p className="text-orange-9 text-sm font-bold">
                  정답률 {correctRate}%
                  <span className="text-orange-7 font-semibold">
                    {' · '}
                    {isHardStat ? '상위권만 푼 문제' : '도전해 볼 만해요'}
                  </span>
                </p>
              ) : (
                <p className="text-orange-9 text-sm font-bold">
                  난이도 {difficultyConfig.label}
                </p>
              )}

              {/* 출처 — 작게 보조 */}
              <p className="text-gray-8 text-xs font-medium">{sourceBadge}</p>

              {/* 호기심 카피 */}
              <span className="text-orange-9 mt-0.5 flex items-center gap-1 text-base font-extrabold">
                <Flame size={16} />이 문제, 풀 수 있을까?
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-white p-5">
        <div>
          <p className="text-orange-7 flex items-center gap-1 text-sm font-semibold">
            <Flame size={14} />
            {challenge.passRate !== null
              ? `통과율 ${challenge.passRate}% (10명 중 ${correctCountOutOf10}명만 맞혔어요)`
              : '집계 중'}
          </p>
          <h3 className="text-text-main mt-1 line-clamp-2">
            {challenge.title}
          </h3>
          <p className="text-gray-8 mt-0.5 text-sm">{challenge.sourceText}</p>
        </div>

        <div className="border-line-line1 mt-auto flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-main font-semibold">
              {challenge.passRate !== null
                ? `통과율 ${challenge.passRate}%`
                : '집계 중'}
            </span>
            <span className="text-gray-4">|</span>
            <span className="text-gray-8 flex items-center gap-1">
              <User size={13} />
              {challenge.participantCount.toLocaleString()}명 도전 중
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

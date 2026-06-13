import Image from 'next/image';
import Link from 'next/link';

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
}: {
  challenge: ChallengeCardData;
}) => {
  const config = SUBJECT_CONFIG[challenge.subject];
  const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty];
  const correctCountOutOf10 =
    challenge.passRate !== null
      ? Math.round((challenge.passRate / 100) * PASS_RATE_DENOMINATOR)
      : null;

  // 출처 배지: "<출처> · N번" (번호는 제목 앞머리에서 파싱, 없으면 출처만).
  const numberMatch = challenge.title.match(QUESTION_NUMBER_PREFIX);
  const questionNumber = numberMatch ? numberMatch[1] : null;
  const displayTitle = numberMatch
    ? challenge.title.slice(numberMatch[0].length)
    : challenge.title;
  const sourceBadge = questionNumber
    ? `${challenge.sourceText} · ${questionNumber}번`
    : challenge.sourceText;

  return (
    <Link
      href={PUBLIC.OPEN_CHALLENGE.DETAIL(challenge.id)}
      className={cn(
        'group focus-visible:ring-key-color-primary flex min-h-full flex-col overflow-hidden rounded-xl border transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none',
        difficultyConfig.cardClass || config.borderClass
      )}
      aria-label={`${challenge.title} 도전하기`}
    >
      <div
        className={cn(
          'relative min-h-[200px]',
          challenge.questionImageUrl
            ? 'flex items-center justify-center bg-white p-6'
            : ''
        )}
      >
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
        {challenge.questionImageUrl ? (
          <Image
            src={challenge.questionImageUrl}
            alt={challenge.title}
            width={280}
            height={160}
            className="max-h-[160px] object-contain"
          />
        ) : (
          // 이미지 없을 때: 오렌지 그라데이션 + 큰 출처 배지·번호 워터마크·큰 제목으로 '도전' 느낌.
          <div className="from-orange-1 to-orange-3 relative flex min-h-[200px] w-full flex-col overflow-hidden bg-gradient-to-br px-5 pt-12 pb-5">
            {questionNumber && (
              <span className="text-orange-4/50 pointer-events-none absolute -right-3 -bottom-7 text-[120px] leading-none font-black tabular-nums select-none">
                {questionNumber}
              </span>
            )}
            <span className="text-orange-9 relative z-10 w-fit rounded-full bg-white/85 px-3 py-1 text-xs font-bold shadow-sm">
              {sourceBadge}
            </span>
            <p className="text-text-main relative z-10 mt-3 line-clamp-3 text-xl leading-snug font-extrabold text-balance">
              {displayTitle}
            </p>
            <span className="text-orange-9 relative z-10 mt-auto flex items-center gap-1 pt-3 text-sm font-bold">
              <Flame size={15} />
              지금 도전하기
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-white p-5">
        <div>
          <p className="text-orange-7 flex items-center gap-1 text-sm font-semibold">
            <Flame size={14} />
            {challenge.passRate !== null
              ? `통과율 ${challenge.passRate}% — 10명 중 ${correctCountOutOf10}명만 맞혔어요`
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

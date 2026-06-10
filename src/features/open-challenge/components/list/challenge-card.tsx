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
const HANDWRITING_FONT =
  '"Nanum Pen Script", "Nanum Brush Script", "KyoboHandwriting2020A", "Cafe24 Ssurround air", "Segoe Print", "Comic Sans MS", cursive';

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
          'relative flex min-h-[200px] items-center justify-center p-6',
          challenge.questionImageUrl ? 'bg-white' : config.bgClass
        )}
      >
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
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
          <div className="flex h-[190px] w-full items-center justify-center">
            <div className="border-line-line2 relative h-full w-full max-w-[300px] rotate-[-1deg] overflow-hidden rounded-sm border bg-white px-6 py-4 shadow-sm">
              <div className="border-line-line1 absolute inset-x-0 top-8 border-t" />
              <div className="border-line-line1 absolute inset-x-0 top-16 border-t" />
              <div className="border-line-line1 absolute inset-x-0 top-24 border-t" />
              <div className="border-line-line1 absolute inset-x-0 top-32 border-t" />
              <div className="border-orange-3 absolute inset-y-0 left-9 border-l" />
              <p
                className="text-text-main line-clamp-3 pt-6 text-center text-2xl leading-[1.65] font-normal"
                style={{ fontFamily: HANDWRITING_FONT }}
              >
                {challenge.title}
              </p>
            </div>
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

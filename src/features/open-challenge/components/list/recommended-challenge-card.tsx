import Image from 'next/image';
import Link from 'next/link';

import { type RecommendedChallengeItem } from '@/entities/open-challenge';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { Flame, Sparkles, User } from 'lucide-react';

type ChallengeSubject = RecommendedChallengeItem['subject'];
type ChallengeDifficulty = RecommendedChallengeItem['difficulty'];

// 카드 본체와 동일한 토큰 규칙: 과목은 중립 그레이 칩,
// 난이도는 오렌지 강도 한 축. (challenge-card.tsx와 일관)
const SUBJECT_CONFIG: Record<ChallengeSubject, { label: string; bgClass: string }> = {
  MATH: { label: '수학', bgClass: 'bg-orange-1' },
  KOREAN: { label: '국어', bgClass: 'bg-gray-1' },
  ENGLISH: { label: '영어', bgClass: 'bg-gray-1' },
  SCIENCE: { label: '탐구', bgClass: 'bg-gray-1' },
};

const DIFFICULTY_CONFIG: Record<
  ChallengeDifficulty,
  { label: string; tagClass: string }
> = {
  TOP: { label: '최상', tagClass: 'bg-orange-9 text-white' },
  HIGH: { label: '상', tagClass: 'bg-orange-7 text-white' },
  MID: { label: '중', tagClass: 'bg-orange-4 text-gray-11' },
  LOW: { label: '하', tagClass: 'bg-gray-3 text-gray-11' },
};

const HANDWRITING_FONT =
  '"Nanum Pen Script", "Nanum Brush Script", "KyoboHandwriting2020A", "Cafe24 Ssurround air", "Segoe Print", "Comic Sans MS", cursive';

export const RecommendedChallengeCard = ({
  challenge,
}: {
  challenge: RecommendedChallengeItem;
}) => {
  const subjectConfig = SUBJECT_CONFIG[challenge.subject];
  const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty];
  // 백엔드는 오답률만 제공 → 통과율은 보조 지표로 환산.
  const passRate = Math.max(0, Math.min(100, 100 - challenge.wrongAnswerRate));

  return (
    <section
      aria-label="오늘의 추천 문제"
      className="border-orange-4 bg-orange-1 mb-8 overflow-hidden rounded-2xl border"
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-stretch md:gap-8 md:p-8">
        {/* 문제 미리보기 */}
        <div
          className={cn(
            'relative flex min-h-[200px] items-center justify-center rounded-xl p-6 md:w-[320px] md:shrink-0',
            challenge.questionImageUrl ? 'bg-white' : subjectConfig.bgClass
          )}
        >
          <div className="absolute top-3 left-3 z-10 flex gap-1.5">
            <span className="bg-gray-11 rounded-md px-2 py-0.5 text-xs font-semibold text-white">
              {subjectConfig.label}
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
              alt={challenge.sourceText}
              width={300}
              height={180}
              className="max-h-[200px] object-contain"
            />
          ) : (
            <div className="flex h-[200px] w-full items-center justify-center">
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

        {/* 추천 메타 + CTA */}
        <div className="flex flex-1 flex-col">
          <p className="text-orange-8 flex items-center gap-1.5 font-label-heading">
            <Sparkles size={16} />
            오늘의 추천 1문제
          </p>

          <h2 className="text-text-main mt-2 line-clamp-2 font-title-heading">
            {challenge.title}
          </h2>
          <p className="text-gray-8 mt-1 font-body2-normal">
            {challenge.sourceText}
          </p>

          {/* 추천 사유 한 줄 */}
          <p className="text-orange-8 mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-body2-heading">
            <Flame size={15} />
            {challenge.recommendReason}
          </p>

          {/* 오답률 · 통과율 · 참여자 */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-body2-normal">
            <span className="text-text-main">
              오답률{' '}
              <span className="text-orange-8 font-body2-heading tabular-nums">
                {challenge.wrongAnswerRate}%
              </span>
            </span>
            <span className="text-gray-4">|</span>
            <span className="text-text-main">
              통과율{' '}
              <span className="text-text-main font-body2-heading tabular-nums">
                {passRate}%
              </span>
            </span>
            <span className="text-gray-4">|</span>
            <span className="text-gray-8 flex items-center gap-1">
              <User size={14} />
              <span className="tabular-nums">
                {challenge.participantCount.toLocaleString()}
              </span>
              명 도전
            </span>
          </div>

          <div className="mt-6 md:mt-auto md:pt-6">
            <Button
              size="large"
              asChild
              className="w-full shadow-[0_5px_0_var(--orange-10)] active:translate-y-[2px] active:shadow-[0_3px_0_var(--orange-10)] md:w-auto"
            >
              <Link
                href={PUBLIC.OPEN_CHALLENGE.DETAIL(challenge.id)}
                aria-label={`${challenge.title} 이 문제 풀기`}
              >
                이 문제 풀기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

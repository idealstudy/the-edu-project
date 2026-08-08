'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { Confetti } from '@/shared/components/ui/confetti';
import { trackRewardShown } from '@/shared/lib/analytics';

type RewardDeltaProps = {
  pointDelta: number;
  pointBalance: number;
  streakKept: boolean;
  streakDays: number;
  expDelta: number;
  expBefore: number;
  level: number;
  leveledUp: boolean;
  treeNodeName: string | null;
  masteryBefore: number;
  masteryAfter: number;
  conquered: boolean;
} | null;

type ChallengeRewardProps = {
  isCorrect: boolean;
  /** 표시용 투영 보상 델타. null이면 정적 텍스트 폴백(구백엔드 또는 투영 실패). */
  reward?: RewardDeltaProps;
  /** 제출 응답의 실제 통계. 없으면 도발 회수 블록을 생략한다. */
  passRate?: number | null;
  participantCount?: number;
};

/**
 * 풀이 완료 보상 영역.
 * reward prop이 있으면 실수치(포인트·스트릭·트리 성장)를 보여주고,
 * 없으면(구백엔드 폴백) 기존 정적 텍스트를 유지한다. 크래시 없음.
 */
export const ChallengeReward = ({
  isCorrect,
  reward,
  passRate,
  participantCount,
}: ChallengeRewardProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const hasFiredRewardShownRef = useRef(false);

  useEffect(() => {
    if (reward?.conquered) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [reward?.conquered]);

  // reward_shown: 보상 UI가 실수치를 표시할 때 1회 발화
  useEffect(() => {
    if (!reward || hasFiredRewardShownRef.current) return;
    hasFiredRewardShownRef.current = true;
    trackRewardShown({
      points: reward.pointDelta,
      exp: reward.expDelta,
      streak: reward.streakDays,
      conquered: reward.conquered,
    });
  }, [reward]);

  const provocation =
    passRate !== null &&
    passRate !== undefined &&
    participantCount !== undefined &&
    participantCount > 0 ? (
      <ResultProvocation
        isCorrect={isCorrect}
        passRate={passRate}
        participantCount={participantCount}
      />
    ) : null;

  const growthMoment = reward?.treeNodeName ? (
    <GrowthMoment reward={reward} />
  ) : null;

  if (isCorrect) {
    return (
      <div
        data-testid="challenge-reward"
        className="border-line-line1 flex flex-col gap-4 rounded-xl border bg-white p-6"
      >
        {showConfetti && <Confetti />}

        <div className="flex items-center gap-3">
          <span
            className="animate-bounce text-3xl"
            aria-hidden
          >
            🎉
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="font-body1-heading text-text-main">
              정답이야! 방금 결과가 네 지도에 남았어.
            </h2>
            <p className="font-caption-normal text-text-sub2">
              포인트가 쌓이고, 약점 나무의 이 개념이 한 칸 자랐어.
            </p>
          </div>
        </div>

        {provocation}

        {/* 실수치 보상 배지 — reward 있을 때만 표시 */}
        {reward && (
          <div
            className="flex flex-wrap gap-2"
            data-testid="reward-badges"
          >
            {reward.pointDelta > 0 && (
              <span
                className="bg-orange-1 text-orange-7 rounded-full px-3 py-1 text-sm font-semibold"
                data-testid="reward-point-badge"
              >
                +{reward.pointDelta} 포인트
              </span>
            )}
            {reward.streakKept && reward.streakDays > 0 && (
              <span
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600"
                data-testid="reward-streak-badge"
              >
                🔥 {reward.streakDays}일 연속
              </span>
            )}
            {reward.treeNodeName &&
              reward.masteryBefore !== reward.masteryAfter && (
                <span
                  className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600"
                  data-testid="reward-mastery-badge"
                >
                  🌿 {reward.treeNodeName} {reward.masteryBefore}→
                  {reward.masteryAfter}
                </span>
              )}
            {reward.conquered && (
              <span
                className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-600"
                data-testid="reward-conquered-badge"
              >
                🏆 정복!
              </span>
            )}
            {reward.leveledUp && (
              <span
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600"
                data-testid="reward-levelup-badge"
              >
                ⬆️ Lv.{reward.level} 달성!
              </span>
            )}
          </div>
        )}

        {growthMoment}

        <Link
          href="/tree"
          className="bg-orange-7 block w-full rounded-lg py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
        >
          내 약점 나무 보기 →
        </Link>
      </div>
    );
  }

  return (
    <div
      data-testid="challenge-reward"
      className="border-line-line1 flex flex-col gap-4 rounded-xl border bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <span
          className="text-3xl"
          aria-hidden
        >
          🌱
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-body1-heading text-text-main">
            여기가 네 약점이야. 방금 그게 진단이야.
          </h2>
          <p className="font-caption-normal text-text-sub2">
            약점 나무에서 이 부분을 채우면 실력이 자랍니다.
          </p>
        </div>
      </div>

      {provocation}

      {/* 오답에도 성장 신호 표시 (스트릭은 유지됨) */}
      {reward && reward.streakKept && reward.streakDays > 0 && (
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600"
            data-testid="reward-streak-badge"
          >
            🔥 {reward.streakDays}일 연속
          </span>
        </div>
      )}

      {growthMoment}

      <Link
        href="/tree"
        className="border-line-line1 text-text-main hover:bg-gray-1 block w-full rounded-lg border py-3 text-center font-semibold transition-colors"
      >
        약점 나무에서 채우기 →
      </Link>
    </div>
  );
};

const ResultProvocation = ({
  isCorrect,
  passRate,
  participantCount,
}: {
  isCorrect: boolean;
  passRate: number;
  participantCount: number;
}) => {
  const wrongAnswerRate = Math.max(0, Math.min(100, 100 - passRate));

  return (
    <section className="bg-gray-11 rounded-xl px-5 py-4 text-white">
      <p className="text-orange-4 text-3xl leading-none font-black tabular-nums">
        {isCorrect ? `${passRate}%` : `${wrongAnswerRate}%`}
      </p>
      <p className="text-gray-2 mt-2 text-sm leading-relaxed">
        {isCorrect
          ? `응시자 ${participantCount.toLocaleString()}명 중 ${passRate}%만 맞혔어. 너도 그 안에 들었어.`
          : `응시자 ${participantCount.toLocaleString()}명 중 ${wrongAnswerRate}%가 여기서 틀렸어. 혼자만 막힌 게 아니고, 이제 메울 지점이 보였어.`}
      </p>
      <p className="text-gray-5 mt-2 text-xs">이 문제의 실제 응시·정답 집계</p>
    </section>
  );
};

const GrowthMoment = ({
  reward,
}: {
  reward: NonNullable<RewardDeltaProps>;
}) => {
  const toBarHeight = (mastery: number) =>
    `${Math.max(8, Math.min(100, mastery))}%`;

  return (
    <section
      className="border-orange-3 bg-orange-1 rounded-xl border p-4"
      data-testid="reward-ridge"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-orange-8 text-sm font-bold">
            방금 문제가 네 지도에 들어갔어
          </p>
          <h3 className="text-text-main font-body1-heading mt-1">
            {reward.treeNodeName} · {reward.masteryBefore}% →{' '}
            {reward.masteryAfter}%
          </h3>
        </div>
        {reward.conquered && (
          <span className="bg-orange-7 rounded-full px-2.5 py-1 text-xs font-bold text-white">
            정복
          </span>
        )}
      </div>

      <div
        className="mt-4 flex h-20 items-end gap-3"
        aria-label="방금 성장한 약점 지도 칸"
      >
        <div className="flex h-full flex-1 flex-col justify-end gap-1">
          <div
            className="bg-orange-3 rounded-t-md"
            style={{ height: toBarHeight(reward.masteryBefore) }}
          />
          <span className="text-gray-7 text-center text-xs font-medium">
            이전
          </span>
        </div>
        <div className="flex h-full flex-1 flex-col justify-end gap-1">
          <div
            className="bg-orange-7 rounded-t-md"
            style={{ height: toBarHeight(reward.masteryAfter) }}
          />
          <span className="text-orange-8 text-center text-xs font-bold">
            방금
          </span>
        </div>
      </div>
      <p className="text-gray-8 mt-3 text-xs leading-relaxed">
        실제 보상 응답의 이 단원 숙련도 변화만 표시했어.
      </p>
    </section>
  );
};

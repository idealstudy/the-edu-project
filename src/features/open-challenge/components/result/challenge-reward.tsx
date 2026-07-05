'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
};

/**
 * 풀이 완료 보상 영역.
 * reward prop이 있으면 실수치(포인트·스트릭·트리 성장)를 보여주고,
 * 없으면(구백엔드 폴백) 기존 정적 텍스트를 유지한다. 크래시 없음.
 */
export const ChallengeReward = ({ isCorrect, reward }: ChallengeRewardProps) => {
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

  if (isCorrect) {
    return (
      <div
        data-testid="challenge-reward"
        className="border-line-line1 flex flex-col gap-4 rounded-xl border bg-white p-6"
      >
        {showConfetti && <Confetti />}

        <div className="flex items-center gap-3">
          <span className="animate-bounce text-3xl" aria-hidden>
            🎉
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="font-body1-heading text-text-main">정답입니다!</h2>
            <p className="font-caption-normal text-text-sub2">
              포인트가 쌓이고, 약점 나무의 이 개념이 한 칸 자랐어요.
            </p>
          </div>
        </div>

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
        <span className="text-3xl" aria-hidden>
          🌱
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-body1-heading text-text-main">
            이 개념이 약점으로 표시됐어요
          </h2>
          <p className="font-caption-normal text-text-sub2">
            약점 나무에서 이 부분을 채우면 실력이 자랍니다.
          </p>
        </div>
      </div>

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

      <Link
        href="/tree"
        className="border-line-line1 text-text-main hover:bg-gray-1 block w-full rounded-lg border py-3 text-center font-semibold transition-colors"
      >
        약점 나무에서 채우기 →
      </Link>
    </div>
  );
};

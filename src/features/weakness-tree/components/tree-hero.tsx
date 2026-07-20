import { type TreeMastery } from '@/entities/tree';
import { type RidgeNode } from '../lib/ridge';

type TreeHeroProps = {
  mastery: TreeMastery;
  valley: RidgeNode | null;
};

/* ─────────────────────────────────────────────────────
 * 히어로 — v4 손실 프레임(카피 + 진행 요약 한 줄) 이식.
 *  v4는 "예상 등급 4 → 목표 2"를 보여주지만, 그건 등급 추정 모델의
 *  출력값이라 이 화면(entities/tree)엔 없다 — 지어내지 않고
 *  실측 평균 정복도 문장으로 대체한다.
 *  ⛔ 백엔드 계약 필요: 등급 추정치(now/target) 필드가 생기면 이 자리에 교체.
 * ────────────────────────────────────────────────────*/
export const TreeHero = ({ mastery, valley }: TreeHeroProps) => {
  const gapCount = mastery.weak + mastery.untested;

  return (
    <section className="bg-gray-12 rounded-[18px] px-6 py-8 text-white md:px-7">
      <p className="font-caption-heading text-orange-3">내 정복 능선</p>
      <h1 className="mt-3.5 text-[22px] leading-[1.4] font-bold tracking-[-0.02em] text-balance md:text-[26px]">
        {gapCount > 0 ? (
          <>
            능선이 <span className="text-[#ff7a4d]">{gapCount}곳</span> 아직
            낮다. 안 메우면 시험장에서 그대로 흔들린다.
          </>
        ) : (
          <>능선이 고르게 채워졌다 — 지금 페이스를 유지해.</>
        )}
      </h1>
      <p className="mt-3 max-w-[46ch] text-[14px] text-[#cfc9c6]">
        옅은 봉우리는 해설 없이는 못 푸는 단원, 비어 있는 봉우리는 아직 안
        풀어본 구멍이다. 코치한테 물어보는 건 괜찮아 — 해설만 참으면 자력으로
        쳐준다.
      </p>
      <p className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-[#a59f9c]">
        평균 정복도{' '}
        <b className="tabular-nums text-white">{mastery.averageScore}%</b>
        {valley && (
          <>
            <span className="text-[#6f6864]">·</span>
            가장 낮은 봉우리{' '}
            <b className="tabular-nums text-[#ff9a9a]">
              {valley.displayName} {valley.masteryScore}%
            </b>
          </>
        )}
      </p>
    </section>
  );
};

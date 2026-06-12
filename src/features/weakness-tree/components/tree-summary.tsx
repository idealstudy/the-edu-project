import { type TreeMastery } from '@/entities/tree';

type StatProps = {
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
};

const Stat = ({ label, value, suffix = '', accent }: StatProps) => (
  <div className="flex flex-col gap-0.5">
    <span className="font-caption-normal text-text-sub2">{label}</span>
    <span
      className={`font-headline2-heading tabular-nums ${
        accent ? 'text-key-color-primary' : 'text-text-main'
      }`}
    >
      {value}
      {suffix}
    </span>
  </div>
);

type TreeSummaryProps = {
  mastery: TreeMastery;
};

/* ─────────────────────────────────────────────────────
 * 진척 요약 — "약점" 단정 대신 채워진 정도를 정직 숫자로.
 *  평균 정복도 게이지(오렌지) + 단계별 카운트.
 * ────────────────────────────────────────────────────*/
export const TreeSummary = ({ mastery }: TreeSummaryProps) => (
  <div className="border-line-line1 flex flex-col gap-4 rounded-[14px] border bg-white p-5">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-caption-heading text-text-sub2">
          내 지도가 채워진 정도
        </span>
        <span className="font-title-heading text-text-main tabular-nums">
          {mastery.averageScore}
          <span className="font-headline1-heading text-text-sub1">%</span>
        </span>
      </div>
      <div className="flex gap-6">
        <Stat
          label="정복"
          value={mastery.mastered}
          accent
        />
        <Stat
          label="진행 중"
          value={mastery.inProgress}
        />
        <Stat
          label="더 풀어볼 단원"
          value={mastery.weak + mastery.untested}
        />
      </div>
    </div>

    {/* 평균 정복도 게이지 */}
    <div
      className="bg-tree-untested h-2.5 w-full overflow-hidden rounded-full"
      role="progressbar"
      aria-valuenow={mastery.averageScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="평균 정복도"
    >
      <div
        className="bg-tree-mastered h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
        style={{ width: `${mastery.averageScore}%` }}
      />
    </div>
  </div>
);

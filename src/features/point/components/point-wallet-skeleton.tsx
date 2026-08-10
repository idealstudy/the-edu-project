import { Skeleton } from '@/shared/components/loading';

const TransactionRowSkeleton = () => (
  <div className="flex items-center gap-3 py-3">
    <Skeleton.Block className="h-9 w-9 shrink-0 rounded-full" />
    <div className="flex flex-1 flex-col gap-1.5">
      <Skeleton.Block className="h-4 w-28" />
      <Skeleton.Block className="h-3 w-20" />
    </div>
    <Skeleton.Block className="h-5 w-12" />
  </div>
);

/* ─────────────────────────────────────────────────────
 * 포인트 지갑 로딩 스켈레톤 (잔액 히어로 + 레벨 + 타임라인)
 * ────────────────────────────────────────────────────*/
export const PointWalletSkeleton = () => (
  <div className="desktop:flex-row desktop:items-start flex flex-col gap-6">
    <div className="flex flex-1 flex-col gap-6">
      <Skeleton.Block className="rounded-card h-45 w-full" />
      <div className="border-line-line1 rounded-card flex flex-col gap-1 border bg-white p-5">
        <Skeleton.Block className="mb-2 h-5 w-32" />
        {Array.from({ length: 4 }).map((_, index) => (
          <TransactionRowSkeleton key={index} />
        ))}
      </div>
    </div>
    <div className="desktop:w-75 w-full shrink-0">
      <Skeleton.Block className="rounded-card h-50 w-full" />
    </div>
  </div>
);

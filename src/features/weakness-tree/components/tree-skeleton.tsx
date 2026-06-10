import { Skeleton } from '@/shared/components/loading';

const NodeSkeleton = () => (
  <Skeleton.Block className="h-[88px] w-full rounded-[12px]" />
);

const SectionSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton.Block className="h-6 w-24" />
    <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <NodeSkeleton key={index} />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────
 * 약점 트리 로딩 스켈레톤 (요약 + 과목 섹션 2개)
 * ────────────────────────────────────────────────────*/
export const TreeSkeleton = () => (
  <div className="flex flex-col gap-8">
    <Skeleton.Block className="h-[120px] w-full rounded-[14px]" />
    <Skeleton.Block className="h-12 w-full rounded-xl" />
    <SectionSkeleton />
    <SectionSkeleton />
  </div>
);

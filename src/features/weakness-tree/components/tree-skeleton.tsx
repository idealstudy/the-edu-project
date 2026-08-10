import { Skeleton } from '@/shared/components/loading';

const NodeSkeleton = () => (
  <Skeleton.Block className="rounded-card h-22 w-full" />
);

const SectionSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton.Block className="h-6 w-24" />
    <div className="desktop:grid-cols-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
    <Skeleton.Block className="rounded-card h-30 w-full" />
    <Skeleton.Block className="h-12 w-full rounded-xl" />
    <SectionSkeleton />
    <SectionSkeleton />
  </div>
);

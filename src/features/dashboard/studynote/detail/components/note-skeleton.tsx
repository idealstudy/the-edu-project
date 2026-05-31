'use client';

import { Skeleton } from '@/shared/components/loading';

export const NoteSideSkeleton = () => {
  return (
    <section className="flex flex-col gap-4">
      <Skeleton.Block className="h-5 w-24 rounded-md" />
      <Skeleton.Block className="h-9 w-5/6 rounded-lg" />
      <Skeleton.Block className="h-9 w-2/3 rounded-lg" />
      <Skeleton.Block className="h-px w-full" />
      <Skeleton.Block className="h-8 w-20 rounded-lg" />
      <Skeleton.Block className="h-5 w-28 rounded-md" />
      <Skeleton.Block className="h-8 w-20 rounded-lg" />
      <div className="flex flex-wrap gap-2">
        <Skeleton.Block className="h-7 w-20 rounded-md" />
        <Skeleton.Block className="h-7 w-24 rounded-md" />
      </div>
    </section>
  );
};

export const NoteMainSkeleton = () => {
  return (
    <section className="flex w-full flex-col gap-6">
      <Skeleton.Block className="h-8 w-44 rounded-lg" />
      <Skeleton.Block className="h-56 w-full rounded-xl" />
    </section>
  );
};

export const NoteBottomSkeleton = () => {
  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton.Block className="h-7 w-16 rounded-md" />
        <Skeleton.Block className="h-7 w-8 rounded-md" />
      </div>

      <article className="border-gray-3 rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton.Block className="h-9 w-9 rounded-full" />
          <Skeleton.Block className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton.Block className="h-24 w-full rounded-xl" />
      </article>
    </section>
  );
};

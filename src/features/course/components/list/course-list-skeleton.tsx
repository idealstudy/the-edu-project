export const CourseListSkeleton = () => (
  <div className="tablet:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] grid grid-cols-1 gap-5">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="border-line-line2 flex flex-col gap-4 rounded-[12px] border bg-white p-5"
      >
        <div className="flex items-start justify-between">
          <div className="bg-gray-1 size-11 animate-pulse rounded-[12px]" />
          <div className="bg-gray-1 h-7 w-14 animate-pulse rounded-full" />
        </div>
        <div className="bg-gray-1 h-5 w-3/4 animate-pulse rounded" />
        <div className="bg-gray-1 h-4 w-full animate-pulse rounded" />
        <div className="bg-gray-1 mt-2 h-5 w-20 animate-pulse rounded" />
      </div>
    ))}
  </div>
);

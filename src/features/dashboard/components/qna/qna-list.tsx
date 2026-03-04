'use client';

import { useState } from 'react';

import { Pagination } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

export const QnAList = () => {
  const [page, setPage] = useState(0);
  const totalPages = 3;
  return (
    <div
      className={cn(
        'bg-gray-white flex flex-1 flex-col items-center gap-3 px-4.5 pt-8 pb-3',
        'tablet:pt-12 tablet:pb-9 tablet:px-36'
      )}
    >
      <div className="flex flex-col gap-8"></div>
      <Pagination
        page={page}
        onPageChange={setPage}
        totalPages={totalPages}
      />
    </div>
  );
};

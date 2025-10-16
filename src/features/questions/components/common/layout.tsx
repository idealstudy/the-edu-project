import { Pagination } from '@/components/ui/pagination';

import { LimitNumber, QuestionFilter, SortKey } from '../../type';
import { SearchFilterBar } from '../detail/search-filter-bar';

export const StudyRoomQuestionDetailLayout = ({
  children,
  search,
  filter,
  sort,
  onSearch,
  onSortChange,
  onFilterChange,
  page,
}: {
  children: React.ReactNode;
  search: string;
  filter?: QuestionFilter;
  sort?: SortKey;
  limit?: LimitNumber;
  onSearch: (value: string) => void;
  onSortChange?: (value: SortKey) => void;
  onLimitChange?: (value: LimitNumber) => void;
  onFilterChange?: (value: QuestionFilter) => void;
  page: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}) => {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[12px]">
      <div className="flex w-full flex-col gap-3">
        <SearchFilterBar
          search={search}
          filter={filter}
          sort={sort}
          onSearch={onSearch}
          onSortChange={onSortChange}
          onFilterChange={onFilterChange}
        />
        {children}
      </div>
      <Pagination {...page} />
    </div>
  );
};

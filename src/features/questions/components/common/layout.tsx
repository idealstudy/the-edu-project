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
    <div className="mt-9 flex flex-col gap-6 rounded-[12px] bg-white">
      <div className="flex flex-col gap-3">
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

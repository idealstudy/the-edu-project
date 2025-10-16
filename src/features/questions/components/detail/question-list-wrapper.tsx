'use client';

import { useEffect, useState } from 'react';

import { QuestionFilter, SortKey } from '../../type';
import { StudyRoomQuestionDetailLayout } from '../common/layout';
import QuestionList from './question-list';

type Props = {
  hasBorder?: boolean;
};

const QuestionListWrapper = ({ hasBorder }: Props) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QuestionFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('LATEST_EDITED');
  const [currentPage, setCurrentPage] = useState(0);

  const handleFilterChange = (e: string) => {
    setFilter(e as QuestionFilter);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSortChange = (e: string) => {
    setSort(e as SortKey);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tempPage = {
    page: currentPage,
    totalPages: 1,
    onPageChange: handlePageChange,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, filter]);

  return (
    <div
      className={
        hasBorder
          ? 'border-line-line1 flex flex-col gap-6 rounded-[12px] border bg-white p-6 px-8'
          : ''
      }
    >
      <StudyRoomQuestionDetailLayout
        search={search}
        filter={filter}
        sort={sort}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        page={tempPage}
      >
        <QuestionList />
      </StudyRoomQuestionDetailLayout>
    </div>
  );
};

export default QuestionListWrapper;

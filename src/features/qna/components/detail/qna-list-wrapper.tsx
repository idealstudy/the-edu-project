'use client';

import { useEffect, useState } from 'react';

import { Pageable } from '@/lib/api';

import { useQnAsTeacherQuery } from '../../services/query';
import { QnAFilter, SortKey } from '../../type';
import { StudyRoomQuestionDetailLayout } from '../common/layout';
import QuestionList from './qna-list';

type Props = {
  studyRoomId: number;
  hasBorder?: boolean;
};

const QuestionListWrapper = ({ studyRoomId, hasBorder }: Props) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QnAFilter>('ALL');
  const [sort, setSort] = useState<SortKey>('LATEST_EDITED');
  const [currentPage, setCurrentPage] = useState(1);

  const pageable: Pageable = {
    page: currentPage,
    size: 20,
    sort: [],
  };

  // TODO: 질문 목록 조회
  const { data: qnaList } = useQnAsTeacherQuery({
    studyRoomId,
    pageable,
    status: filter,
    sort,
  });

  const handleFilterChange = (e: string) => {
    setFilter(e as QnAFilter);
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

  const page = {
    page: currentPage,
    totalPages: qnaList?.totalPages || 1,
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
        page={page}
      >
        <QuestionList
          studyRoomId={studyRoomId}
          data={qnaList?.content || []}
        />
      </StudyRoomQuestionDetailLayout>
    </div>
  );
};

export default QuestionListWrapper;

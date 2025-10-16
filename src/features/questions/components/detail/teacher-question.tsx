'use client';

import { useEffect, useState } from 'react';

import { QuestionFilter, SortKey } from '../../type';
import { StudyRoomQuestionDetailLayout } from '../common/layout';
import QuestionList from './question-list';

export default function TeacherQuestionSession() {
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
    <div className="">
      <p className="font-headline1-heading whitespace-pre-wrap">
        {'학생들이 피드백을 기다리고 있어요.\n답변을 남겨주세요!'}
      </p>
      {/* TODO: 질문 목록 API 연동*/}
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
}

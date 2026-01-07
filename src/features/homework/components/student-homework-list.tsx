'use client';

import { useState } from 'react';

import { ListItem } from '@/features/study-rooms/components/common/list-item';
import { MiniSpinner } from '@/shared/components/loading';
import { formatYYYYMMDD, getRelativeTimeString } from '@/shared/lib/utils';

import { HOMEWORK_SUBMIT_STATUS_LABEL } from '../model/constants';
import { HomeworkPageable, StudentHomeworkItem } from '../model/homework.types';
import { HomeworkDropdown } from './dropdown';

export const StudentHomeworkList = ({
  data,
  studyRoomId,
  pageable,
  keyword,
  onRefresh,
  isLoading,
}: {
  data: StudentHomeworkItem[];
  studyRoomId: number;
  pageable: HomeworkPageable;
  keyword: string;
  onRefresh: () => void;
  isLoading: boolean;
}) => {
  const [open, setOpen] = useState(0);

  const handleOpen = (id: number) => {
    setOpen(open === id ? 0 : id);
  };

  // 마감일 계산
  const deadLineDate = (date: string) => {
    const today = new Date();
    const end = new Date(date);

    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0 || diffDays === 0) return '마감';
    if (diffDays === 1 || diffDays > 1) return `마감 ${diffDays}일 전`;
  };

  // 과제가 없을 시
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <MiniSpinner />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p>아직 등록한 과제가 없어요.</p>
        <p>선생님이 과제를 등록하면 여기에서 확인할 수 있어요!</p>
      </div>
    );
  }

  return data.map((item) => (
    <ListItem
      key={item.id}
      warn={deadLineDate(item.deadline)}
      title={item.title}
      subtitle={formatYYYYMMDD(item.deadline)}
      rightTitle={HOMEWORK_SUBMIT_STATUS_LABEL[item.status]}
      rightSubTitle={getRelativeTimeString(item.modDate)}
      dropdown={
        <HomeworkDropdown
          open={open}
          handleOpen={handleOpen}
          item={item}
          studyRoomId={studyRoomId}
          pageable={pageable}
          keyword={keyword}
          onRefresh={onRefresh}
        />
      }
      href={`/study-rooms/${studyRoomId}/homework/${item.id}`}
      id={item.id}
    />
  ));
};

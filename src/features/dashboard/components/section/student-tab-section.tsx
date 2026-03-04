'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  useStudentDashboardHomeworkListQuery,
  useStudentDashboardNoteListQuery,
  useStudentDashboardQnaListQuery,
  useStudentDashboardStudyRoomListQuery,
} from '@/features/dashboard/hooks/use-dashboard-query';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';

import TabbedSection from './tabbed-section';

// ─── 수업노트 탭 ───────────────────────────────────────────────────────────────

const StudentNoteTabContent = ({ studyRoomId }: { studyRoomId?: number }) => {
  const { data } = useStudentDashboardNoteListQuery({
    studyRoomId,
    page: 0,
    size: 4,
    sortKey: 'LATEST_EDITED',
  });
  const notes = data?.content ?? [];

  if (notes.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">수업노트가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {notes.map((note) => (
        <Link
          key={note.id}
          href={PRIVATE.NOTE.DETAIL(note.studyRoomId, note.id)}
          className="bg-orange-1 border-orange-3 flex w-full flex-col gap-1 rounded-lg border px-7 py-7"
        >
          <span className="font-label-heading text-orange-7">
            {note.studyRoomName}
          </span>
          <span className="font-body1-heading text-gray-12 line-clamp-2 leading-tight">
            {note.title}
          </span>
          <span className="font-body2-normal text-gray-12 line-clamp-2 leading-tight">
            {note.contentPreview}
          </span>
        </Link>
      ))}
    </div>
  );
};

// ─── 질문 탭 ──────────────────────────────────────────────────────────────────

const StudentQnaTabContent = () => {
  const { data } = useStudentDashboardQnaListQuery({
    page: 0,
    size: 4,
    sortKey: 'LATEST',
  });
  const qnas = data?.content ?? [];

  if (qnas.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">작성한 질문이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {qnas.map((qna) => (
        <Link
          key={qna.id}
          href={PRIVATE.QUESTIONS.DETAIL(qna.studyRoomId, qna.id)}
          className="bg-gray-white border-gray-3 flex w-full flex-col gap-1 rounded-lg border px-5 py-4"
        >
          <span className="font-label-heading text-orange-7">
            {qna.studyRoomName}
          </span>
          <span className="font-body2-heading text-gray-12 line-clamp-1">
            {qna.title}
          </span>
          <span className="font-caption-normal text-gray-7 line-clamp-1">
            {qna.contentPreview}
          </span>
        </Link>
      ))}
    </div>
  );
};

// ─── 과제 탭 ──────────────────────────────────────────────────────────────────

const DEADLINE_LABEL_MAP: Record<'UPCOMING' | 'TODAY' | 'OVERDUE', string> = {
  UPCOMING: 'D-',
  TODAY: 'D-day',
  OVERDUE: '마감',
};

const formatDeadlineLabel = (
  label: 'UPCOMING' | 'TODAY' | 'OVERDUE',
  dday: number
) => {
  if (label === 'UPCOMING') return `D-${dday}`;
  return DEADLINE_LABEL_MAP[label];
};

const StudentHomeworkTabContent = ({
  studyRoomId,
}: {
  studyRoomId?: number;
}) => {
  const { data } = useStudentDashboardHomeworkListQuery({
    studyRoomId,
    page: 0,
    size: 4,
    sortKey: 'DEADLINE_IMMINENT',
  });
  const homeworks = data?.content ?? [];

  if (homeworks.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">제출할 과제가 없어요.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3',
        'tablet:grid tablet:grid-cols-2 tablet:gap-5'
      )}
    >
      {homeworks.map((homework, index) => {
        const deadlineLabel = formatDeadlineLabel(
          homework.deadlineLabel,
          homework.dday
        );
        return (
          <Link
            key={homework.id}
            href={PRIVATE.HOMEWORK.DETAIL(homework.studyRoomId, homework.id)}
            className={cn(
              'bg-gray-white border-gray-3 flex flex-col gap-3 rounded-xl border px-7 pt-6 pb-7 shadow-sm transition-shadow hover:shadow-md',
              index >= 2 && 'tablet:flex hidden'
            )}
          >
            <div className="flex justify-end">
              <span
                className={cn(
                  'font-label-heading rounded-[4px] px-2 py-1',
                  homework.deadlineLabel === 'OVERDUE'
                    ? 'bg-gray-2 text-gray-7'
                    : 'bg-orange-2 text-orange-7'
                )}
              >
                {deadlineLabel}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-heading text-orange-7">
                {homework.studyRoomName}
              </span>
              <span className="font-body1-heading text-gray-12 line-clamp-2 leading-tight">
                {homework.title}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

// ─── StudentTabSection ────────────────────────────────────────────────────────
// 학생 대시보드 탭 섹션.
// - 스터디룸 목록을 fetch하고 선택한 스터디룸 ID를 관리합니다.
// - 각 탭 콘텐츠 컴포넌트에 selectedId를 전달해 필터링된 데이터를 보여줍니다.

const STUDENT_TABS = ['수업노트', '질문', '과제'];

const StudentTabSection = ({ className }: { className?: string }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: studyRooms = [] } = useStudentDashboardStudyRoomListQuery();

  const content = [
    <StudentNoteTabContent
      key="note"
      studyRoomId={selectedId ?? undefined}
    />,
    <StudentQnaTabContent key="qna" />,
    <StudentHomeworkTabContent
      key="homework"
      studyRoomId={selectedId ?? undefined}
    />,
  ];

  return (
    <TabbedSection
      studyRooms={studyRooms}
      selectedId={selectedId}
      onSelectStudyRoom={setSelectedId}
      tabs={STUDENT_TABS}
      content={content}
      className={className}
    />
  );
};

export default StudentTabSection;

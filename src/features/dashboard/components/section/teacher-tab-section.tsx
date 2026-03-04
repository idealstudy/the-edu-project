'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  useTeacherDashboardHomeworkListQuery,
  useTeacherDashboardMemberListQuery,
  useTeacherDashboardNoteListQuery,
  useTeacherDashboardStudyRoomListQuery,
} from '@/features/dashboard/hooks/use-dashboard-query';
import { PRIVATE } from '@/shared/constants';

import HomeworkSectionContent from '../section-content/homework-section-content';
import StudentsSectionContent from '../section-content/student-section-content';
import TabbedSection from './tabbed-section';

// ─── 수업노트 탭 ───────────────────────────────────────────────────────────────

const TeacherNoteTabContent = ({ studyRoomId }: { studyRoomId?: number }) => {
  const { data } = useTeacherDashboardNoteListQuery({
    studyRoomId,
    page: 0,
    size: 4,
    sortKey: 'LATEST_EDITED',
  });
  const notes = data?.content ?? [];

  if (notes.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">
          작성한 수업노트가 없어요.
        </p>
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

// ─── 멤버 탭 ──────────────────────────────────────────────────────────────────
// studyRoomId가 null(전체)이면 0을 전달해 전체 멤버를 조회합니다.

const TeacherMemberTabContent = ({ studyRoomId }: { studyRoomId?: number }) => {
  const [page, setPage] = useState(0);

  const { data } = useTeacherDashboardMemberListQuery({
    studyRoomId,
    page,
    size: 10,
    sortKey: 'LATEST',
  });

  return (
    <StudentsSectionContent
      students={data?.content ?? []}
      page={page}
      totalPages={data?.totalPages ?? 0}
      onPageChange={setPage}
    />
  );
};

// ─── 과제 탭 ──────────────────────────────────────────────────────────────────

const TeacherHomeworkTabContent = ({
  studyRoomId,
}: {
  studyRoomId?: number;
}) => {
  const { data } = useTeacherDashboardHomeworkListQuery({
    studyRoomId,
    page: 0,
    size: 4,
    sortKey: 'DEADLINE_IMMINENT',
  });

  return (
    <HomeworkSectionContent
      homeworks={data?.content ?? []}
      page={0}
      totalPages={data?.totalPages ?? 0}
      onPageChange={() => {}}
      emptyMessage="등록된 과제가 없어요."
    />
  );
};

// ─── TeacherTabSection ────────────────────────────────────────────────────────
// 선생님 대시보드 탭 섹션.
// - 스터디룸 목록을 fetch하고 선택한 스터디룸 ID를 관리합니다.
// - selectedId가 null(전체)이면 모든 탭에서 전체 데이터를 조회합니다.

const TEACHER_TABS = ['수업노트', '멤버', '과제'];

const TeacherTabSection = ({ className }: { className?: string }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: studyRooms = [] } = useTeacherDashboardStudyRoomListQuery();

  const content = [
    <TeacherNoteTabContent
      key="note"
      studyRoomId={selectedId ?? undefined}
    />,
    <TeacherMemberTabContent
      key="member"
      studyRoomId={selectedId ?? undefined}
    />,
    <TeacherHomeworkTabContent
      key="homework"
      studyRoomId={selectedId ?? undefined}
    />,
  ];

  return (
    <TabbedSection
      studyRooms={studyRooms}
      selectedId={selectedId}
      onSelectStudyRoom={setSelectedId}
      tabs={TEACHER_TABS}
      content={content}
      className={className}
    />
  );
};

export default TeacherTabSection;

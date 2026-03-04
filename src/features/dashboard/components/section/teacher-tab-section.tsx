'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  useTeacherDashboardHomeworkListQuery,
  useTeacherDashboardMemberListQuery,
  useTeacherDashboardNoteListQuery,
  useTeacherDashboardQnaListQuery,
  useTeacherDashboardStudyRoomListQuery,
} from '@/features/dashboard/hooks/use-dashboard-query';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';

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
  const { data } = useTeacherDashboardMemberListQuery({
    studyRoomId,
    page: 0,
    size: 10,
    sortKey: 'LATEST',
  });
  const members = data?.content ?? [];

  if (members.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">
          아직 참여 중인 학생이 없어요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-gray-white border-gray-3 flex items-center gap-4 rounded-lg border px-5 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="font-body2-heading text-gray-black">{member.name}</p>
            <p className="font-caption-normal text-gray-7 truncate">
              {member.email}
            </p>
          </div>
          <span
            className={cn(
              'font-label-heading shrink-0 rounded-full px-3 py-1 text-xs',
              member.state === 'APPROVED'
                ? 'bg-orange-2 text-orange-7'
                : 'bg-gray-2 text-gray-7'
            )}
          >
            {member.state === 'APPROVED' ? '승인됨' : member.state}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── 질문 탭 ──────────────────────────────────────────────────────────────────

const TeacherQnaTabContent = () => {
  const { data } = useTeacherDashboardQnaListQuery({
    page: 0,
    size: 4,
    sortKey: 'LATEST',
  });
  const qnas = data?.content ?? [];

  if (qnas.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">
          아직 도착한 질문이 없어요.
        </p>
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
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-heading text-orange-7">
              {qna.studyRoomName}
            </span>
            <span className="font-caption-normal text-gray-7 shrink-0">
              {qna.studentName}
            </span>
          </div>
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

const formatDeadlineLabel = (
  label: 'UPCOMING' | 'TODAY' | 'OVERDUE',
  dday: number
) => {
  if (label === 'UPCOMING') return `D-${dday}`;
  if (label === 'TODAY') return 'D-day';
  return '마감';
};

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
  const homeworks = data?.content ?? [];

  if (homeworks.length === 0) {
    return (
      <div className="flex h-22 w-full items-center justify-center">
        <p className="font-body2-normal text-gray-8">등록된 과제가 없어요.</p>
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
            <div className="flex items-center justify-between gap-2">
              <span className="font-label-heading text-orange-7">
                {homework.studyRoomName}
              </span>
              <span
                className={cn(
                  'font-label-heading shrink-0 rounded-[4px] px-2 py-1',
                  homework.deadlineLabel === 'OVERDUE'
                    ? 'bg-gray-2 text-gray-7'
                    : 'bg-orange-2 text-orange-7'
                )}
              >
                {deadlineLabel}
              </span>
            </div>
            <span className="font-body1-heading text-gray-12 line-clamp-2 leading-tight">
              {homework.title}
            </span>
            <div className="flex items-center gap-2">
              <div className="bg-gray-2 h-1.5 flex-1 rounded-full">
                <div
                  className="bg-orange-5 h-full rounded-full"
                  style={{ width: `${homework.submittedRatePercent}%` }}
                />
              </div>
              <span className="font-caption-normal text-gray-7 shrink-0">
                제출 {homework.submittedRatePercent}%
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

// ─── TeacherTabSection ────────────────────────────────────────────────────────
// 선생님 대시보드 탭 섹션.
// - 스터디룸 목록을 fetch하고 선택한 스터디룸 ID를 관리합니다.
// - selectedId가 null(전체)이면 모든 탭에서 전체 데이터를 조회합니다.

const TEACHER_TABS = ['수업노트', '멤버', '질문', '과제'];

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
    <TeacherQnaTabContent key="qna" />,
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

'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { ColumnLayout } from '@/layout';
import { DropdownMenu } from '@/shared/components/ui';
import { useRole } from '@/shared/hooks';
import { cn } from '@/shared/lib';

import { useStudentHomeworkDetail } from '../../hooks/student/useStudentHomeworkQuries';
import { useTeacherRemoveHomework } from '../../hooks/teacher/useTeacherHomeworkMutations';
import { useGetTeacherHomeworkDetail } from '../../hooks/teacher/useTeacherHomeworkQuries';

type Props = {
  studyRoomId: number;
  homeworkId: number;
};

export const HomeworkDetailLeft = ({ studyRoomId, homeworkId }: Props) => {
  const router = useRouter();
  const { role } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const teacherQuery = useGetTeacherHomeworkDetail(studyRoomId, homeworkId);

  const studentQuery = useStudentHomeworkDetail(studyRoomId, homeworkId);

  const data = role === 'ROLE_TEACHER' ? teacherQuery.data : studentQuery.data;

  const isPending =
    role === 'ROLE_TEACHER' ? teacherQuery.isPending : studentQuery.isPending;

  const { mutate } = useTeacherRemoveHomework();

  // 마감기한 계산
  const deadLineTime = (time: string) => {
    if (!time) return '없음';
    return time.split('T')[0];
  };

  // 진행중 or 마감
  const isDone = () => {
    if (!data?.homework.deadline) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(data.homework.deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    return today >= deadlineDate;
  };

  const handleEdit = () => {
    setIsOpen(false);
    router.push(`/study-rooms/${studyRoomId}/homework/${homeworkId}/edit`);
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      mutate({
        studyRoomId,
        homeworkId,
      });
      router.push(`/study-rooms/${studyRoomId}/homework`);
    }
    setIsOpen(false);
  };

  if (isPending) return <div>로딩중...</div>;

  return (
    <>
      <ColumnLayout.Left className="rounded-[12px] bg-white">
        <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white p-10">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'font-body1-normal',
                isDone()
                  ? 'text-orange-scale-orange-50'
                  : 'text-gray-scale-gray-60'
              )}
            >
              {isDone() ? '마감' : '진행중'}
            </span>
            {role === 'ROLE_TEACHER' && (
              <DropdownMenu
                open={isOpen}
                onOpenChange={setIsOpen}
              >
                <DropdownMenu.Trigger className="flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-gray-100">
                  <Image
                    src="/studynotes/gray-kebab.svg"
                    width={24}
                    height={24}
                    alt="homework"
                    className="cursor-pointer"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="flex min-w-[110px] flex-col items-stretch">
                  <DropdownMenu.Item
                    className="justify-center"
                    onClick={handleEdit}
                  >
                    {'수정하기'}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="justify-center"
                    variant="danger"
                    onClick={handleDelete}
                  >
                    {'삭제하기'}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>
          <div>
            마감 기한 :{' '}
            <span className="text-gray-scale-gray-70vhh">
              {deadLineTime(data?.homework.deadline ?? '없음')}
            </span>
          </div>
          <h3 className="font-headline1-heading">{data?.homework.title}</h3>
          <hr className="text-gray-scale-gray-10" />
          <div className="font-label-normal flex cursor-default flex-col gap-2">
            <div className="bg-gray-scale-gray-1 text-gray-scale-gray-70 flex w-fit items-center gap-1 rounded-sm px-2 py-1">
              <Image
                src="/homework/link.svg"
                width={14}
                height={14}
                alt="study-notes"
                className="h-[14px] w-[14px]"
              />
              <span>연결 수업노트</span>
            </div>
            <div>
              {data?.homework.teachingNoteInfoList.length === 0 ? (
                <div>없음</div>
              ) : (
                data?.homework.teachingNoteInfoList.map((note) => (
                  <div key={note.id}>
                    <a
                      href={`/study-rooms/${studyRoomId}/note/${note.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-orange-scale-orange-50 cursor-pointer"
                    >
                      {note.name}
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ColumnLayout.Left>
    </>
  );
};

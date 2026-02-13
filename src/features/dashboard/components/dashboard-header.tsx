'use client';

import Image from 'next/image';

import { useTeacherDashboardReportQuery } from '@/features/dashboard/hooks/use-dashboard-query';
import { cn } from '@/shared/lib';
import { useMemberStore } from '@/store';

const DashboardHeader = ({ isTeacher = false }: { isTeacher: boolean }) => {
  const member = useMemberStore((s) => s.member);
  const teacherName = member?.name || '선생님';

  const { data: teacherReport } = useTeacherDashboardReportQuery();

  if (!isTeacher) return null;

  const teacherMessage = ['선생님', '오늘은 어떤 수업을 진행하세요?'];

  const teacherStats = [
    {
      value: teacherReport?.studyRoomCount ?? 0,
      unit: '개',
      label: '스터디룸',
    },
    {
      value: teacherReport?.teachingNoteCount ?? 0,
      unit: '개',
      label: '수업노트',
    },
    { value: teacherReport?.studentCount ?? 0, unit: '명', label: '학생' },
    { value: teacherReport?.qnaCount ?? 0, unit: '개', label: '질문' },
  ];

  const TeacherReport = ({ className }: { className: string }) => {
    return (
      <div
        className={cn(
          'border-gray-scale-gray-10 bg-gray-scale-white flex w-fit gap-5 rounded-2xl border px-6 py-6 shadow-sm',
          className
        )}
      >
        {teacherStats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col items-center gap-1',
              index !== teacherStats.length - 1
                ? 'after:content-[" "] after:bg-gray-scale-gray-10 relative w-20 pr-5 after:absolute after:right-0 after:block after:h-full after:w-[1px]'
                : 'w-15'
            )}
          >
            <span className="text-gray-scale-gray-95 text-[20px] font-bold">
              {stat.value.toLocaleString()}
              {stat.unit}
            </span>
            <span className="font-body2-normal text-gray-scale-gray-50">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="desktop:pb-8 desktop:pt-19 tablet:px-20 desktop:px-20 flex flex-col items-center gap-3 bg-[#FCFBFA] px-4.5 pt-8 pb-3">
      <div className="flex h-fit w-full items-end justify-between">
        {/* 왼쪽: 텍스트 및 통계 */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h1 className="font-headline2-normal desktop:font-title-heading desktop:font-medium text-gray-black leading-tight">
            <span className="font-bold">{teacherName}</span> {teacherMessage[0]}
            ,<br />
            {teacherMessage[1]}
          </h1>
          <TeacherReport className="tablet:flex hidden" />
        </div>

        {/* 오른쪽: 일러스트 */}
        <div className="shrink-0">
          <Image
            src="/dashboard/dashboard-character.png"
            alt="대시보드 캐릭터"
            width={250}
            height={250}
            className="desktop:block hidden object-contain"
          />
          <Image
            src="/dashboard/dashboard-character.png"
            alt="대시보드 캐릭터"
            width={200}
            height={200}
            className="tablet:block desktop:hidden block hidden object-contain"
          />
          <Image
            src="/dashboard/dashboard-character.png"
            alt="대시보드 캐릭터"
            width={100}
            height={100}
            className="tablet:hidden block object-contain"
          />
        </div>
      </div>
      <TeacherReport className="tablet:hidden flex" />
    </div>
  );
};

export default DashboardHeader;

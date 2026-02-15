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
          'border-gray-3 bg-gray-white tablet:p-6 tablet:gap-5 flex w-fit gap-2 rounded-xl border p-4',
          className
        )}
      >
        {teacherStats.map((stat, index) => (
          <div
            key={stat.label}
            className="tablet:gap-5 flex items-center gap-2"
          >
            <div className="flex w-15 flex-col items-center gap-1">
              <span className="text-gray-12 font-body2-heading tablet:font-body1-heading desktop:font-headline2-heading">
                {stat.value.toLocaleString()}
                {stat.unit}
              </span>
              <span className="text-gray-8 font-caption-normal tablet:font-label-normal">
                {stat.label}
              </span>
            </div>

            {index !== teacherStats.length - 1 && (
              <div className="bg-gray-3 h-full w-[1px]" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tablet:pt-19 tablet:px-20 tablet:pb-0 flex flex-col items-center gap-3 bg-[#FCFBFA] px-4.5 pt-8 pb-3">
      <div className="relative flex h-fit w-full items-end justify-between">
        {/* 왼쪽: 텍스트 및 통계 */}
        <div className="tablet:h-50 desktop:h-55 flex h-25 min-w-0 flex-col gap-6">
          <p className="font-body1-normal tablet:font-headline1-normal desktop:font-title-normal text-gray-black">
            <span className="font-bold">{teacherName}</span> 선생님,
            <br />
            오늘은 어떤 수업을 진행하세요?
          </p>
          <TeacherReport className="tablet:flex hidden" />
        </div>

        {/* 오른쪽: 일러스트 */}
        <div className="absolute top-0 right-0">
          <Image
            src="/dashboard/dashboard-character.png"
            alt="대시보드 캐릭터"
            width={220}
            height={220}
            sizes="(min-width: 1200px) 220px, (min-width: 768px) 200px, 100px"
            className="tablet:w-50 tablet:h-50 desktop:w-55 desktop:h-55 h-25 w-25 object-contain"
          />
        </div>
      </div>
      <TeacherReport className="tablet:hidden flex" />
    </div>
  );
};

export default DashboardHeader;

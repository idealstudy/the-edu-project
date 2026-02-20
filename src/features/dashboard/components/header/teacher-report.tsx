'use client';

import { useTeacherDashboardReportQuery } from '@/features/dashboard/hooks/use-dashboard-query';
import { cn } from '@/shared/lib';

export const TeacherReport = ({ className = '' }: { className?: string }) => {
  const { data: teacherReport } = useTeacherDashboardReportQuery();

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

  return (
    <div
      className={cn(
        'border-gray-3 bg-gray-white flex w-fit gap-2 rounded-xl border p-4',
        'tablet:gap-5 tablet:p-6',
        className
      )}
    >
      {teacherStats.map((stat, index) => (
        <div
          key={stat.label}
          className="tablet:gap-5 flex items-center gap-2"
        >
          <div className="flex w-15 flex-col items-center gap-1">
            <span
              className={cn(
                'text-gray-12 font-body2-heading',
                'tablet:font-body1-heading desktop:font-headline2-heading'
              )}
            >
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

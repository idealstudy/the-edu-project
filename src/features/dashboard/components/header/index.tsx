'use client';

import Image from 'next/image';

import { cn } from '@/shared/lib';
import { useMemberStore } from '@/store';

import { TeacherReport } from './teacher-report';

const DashboardHeader = ({ isTeacher = false }: { isTeacher?: boolean }) => {
  const member = useMemberStore((s) => s.member);
  const teacherName = member?.name || '선생님';

  if (!isTeacher) return null;

  return (
    <div
      className={cn(
        'bg-system-background flex flex-col items-center gap-3 px-4.5 pt-8 pb-3',
        'tablet:pt-19 tablet:px-20 tablet:pb-0'
      )}
    >
      <div className="relative flex h-fit w-full items-end justify-between">
        {/* 왼쪽: 텍스트 및 통계 */}
        <div
          className={cn(
            'flex h-25 min-w-0 flex-col gap-6',
            'tablet:h-50 desktop:h-55'
          )}
        >
          <p
            className={cn(
              'font-body1-normal text-gray-black',
              'tablet:font-headline1-normal desktop:font-title-normal'
            )}
          >
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
            className={cn(
              'h-25 w-25 object-contain',
              'tablet:w-50 tablet:h-50 desktop:w-55 desktop:h-55'
            )}
          />
        </div>
      </div>
      <TeacherReport className="tablet:hidden flex" />
    </div>
  );
};

export default DashboardHeader;

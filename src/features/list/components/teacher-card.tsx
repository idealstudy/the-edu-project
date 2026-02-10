'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/shared/lib';

import { PublicTeacherProfile } from '../types/teacher.types';

interface TeacherCardProps {
  teacher: PublicTeacherProfile;
}

export const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const teacherImg = teacher.id % 2 === 0 ? '1' : '2';

  return (
    <Link
      href={`/profile/${teacher.id}`}
      className={cn(
        'group border-gray-scale-gray-10 relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300 md:p-6',
        'hover:scale-105 hover:shadow-xl'
      )}
    >
      {teacher.isNewTeacher && (
        <div className="from-key-color-primary to-orange-scale-orange-60 absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white shadow-md md:top-4 md:right-4 md:px-3 md:py-1 md:text-xs">
          NEW
        </div>
      )}

      <div className="border-gray-scale-gray-95 relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-full border bg-gray-50 p-1 md:h-[100px] md:w-[100px]">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <Image
            src={
              teacher.profileImageUrl ??
              `/character/img_profile_teacher0${teacherImg}.png`
            }
            alt={teacher.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="bg-orange-scale-orange-5 text-orange-scale-orange-50 flex w-fit items-center justify-center rounded-[4px] px-[8px] py-[2px] text-[12px] font-medium">
          영어
        </div>

        <div className="font-body1-heading truncate text-lg text-gray-900 md:text-xl">
          {teacher.name} 선생님
        </div>

        <hr className="my-1 border-gray-100" />

        <div className="group-hover:text-key-color-primary mt-1 flex items-center justify-end text-[14px] font-medium text-gray-400 transition-colors md:text-[14px]">
          스터디룸 바로가기 <span className="ml-1 text-[10px]">&gt;</span>
        </div>
      </div>
    </Link>
  );
};

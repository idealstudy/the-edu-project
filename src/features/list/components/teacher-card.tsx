'use client';

import { IoIosArrowForward } from 'react-icons/io';

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
        'group border-gray-3 relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300 md:p-6',
        'hover:scale-105 hover:shadow-xl'
      )}
    >
      {/* {teacher.isNewTeacher && ( */}

      {/* // )} */}

      <div className="border-gray-12 relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-full border bg-gray-50 p-1 md:h-[100px] md:w-[100px]">
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
        <div className="flex gap-2">
          {teacher.isNewTeacher && (
            <div className="bg-orange-7 font-label-heading h-[27px] w-[47px] rounded-full px-2 py-1 text-white">
              NEW
            </div>
          )}

          <div className="bg-orange-2 text-orange-7 font-label-heading flex w-fit items-center justify-center rounded-[4px] px-[8px] py-[4px]">
            영어
          </div>
        </div>
        <div className="font-body1-heading text-gray-12 truncate text-lg md:text-xl">
          {teacher.name} 선생님
        </div>

        <hr className="my-1 border-gray-100" />

        <div className="group-hover:text-orange-7 text-gray-10 mt-1 flex items-center justify-end text-[14px] transition-colors md:text-[14px]">
          스터디룸 바로가기
          <IoIosArrowForward className="ml-1 h-[16px] w-[16px]" />
        </div>
      </div>
    </Link>
  );
};

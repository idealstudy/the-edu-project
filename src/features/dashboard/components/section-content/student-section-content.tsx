'use client';

import Image from 'next/image';
import Link from 'next/link';

import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import { EllipsisVertical } from 'lucide-react';

import MoreButton from './more-button';

export interface StudentsSectionContentProps {
  students: {
    id: string;
    name: string;
    email: string;
    avatarSrc?: string;
    signedUpAt: string;
  }[];
  lastStudyroomId: number;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

const formatDate = (dateStr: string): string => {
  const now = new Date();
  const targetDate = new Date(dateStr);
  if (Number.isNaN(targetDate.getTime())) return '';
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays < 4) return `${diffInDays}일전`;
  const year = targetDate.getFullYear() % 100;
  const month = targetDate.getMonth() + 1;
  const date = targetDate.getDate();
  const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
  return `${year}/${month}/${date} (${dayOfWeek})`;
};

const StudentsSectionContent = ({
  students,
  lastStudyroomId,
}: StudentsSectionContentProps) => {
  if (students.length === 0) {
    return (
      <div className="flex h-22 w-full flex-col items-center justify-center gap-3">
        <p
          className={cn(
            'font-body2-normal text-orange-7',
            lastStudyroomId > 0 && 'text-gray-8'
          )}
        >
          상단을 참고해 스터디룸을 생성하고 학생을 초대해주세요.
        </p>

        <Link
          href={PRIVATE.ROOM.DETAIL(lastStudyroomId)}
          className={cn(
            'tablet:flex font-headline2-normal bg-gray-white border-gray-5 desktop:py-5 hidden w-full items-center justify-center rounded-[8px] border-1 py-4',
            lastStudyroomId > 0
              ? 'text-gray-12'
              : 'text-gray-5 pointer-events-none'
          )}
        >
          학생 초대하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="bg-gray-white flex w-full flex-col gap-3">
        {students.map((student) => (
          <div
            key={student.id}
            className={cn('flex w-full gap-4 rounded-xl px-3 py-3')}
          >
            {/* 아바타 */}
            <div className="bg-gray-white border-gray-12 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-1">
              <Image
                src={
                  student.avatarSrc ?? '/character/img_profile_student01.png'
                }
                alt={`${student.name} 프로필`}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full"
              />
            </div>

            {/* 가입일, 이메일 */}
            <div className="min-w-0 flex-1">
              <p className="font-body2-normal text-gray-black">
                {student.name}
              </p>
              <p className="font-caption-normal text-gray-9">
                {formatDate(student.signedUpAt)} 가입
              </p>
              <p className="font-caption-normal text-gray-7 truncate">
                {student.email}
              </p>
            </div>

            {/* 더보기 아이콘 */}
            <button
              type="button"
              className="text-gray-5 hover:bg-gray-1 flex h-9 w-9 items-center justify-center rounded-lg"
              aria-label={`${student.name} 더보기`}
            >
              <EllipsisVertical className="h-6 w-6" />
            </button>
          </div>
        ))}
      </div>
      <MoreButton href={'#'} />
    </div>
  );
};

export default StudentsSectionContent;

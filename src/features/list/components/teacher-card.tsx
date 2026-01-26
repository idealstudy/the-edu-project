'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/shared/lib';

import { PublicTeacherProfile } from '../types/teacher.types';

interface TeacherCardProps {
  teacher: PublicTeacherProfile;
}

export const TeacherCard = ({ teacher }: TeacherCardProps) => {
  return (
    <Link
      href={`/profile/${teacher.id}`}
      className={cn(
        'group border-line-line1 relative overflow-hidden rounded-2xl border-2',
        'bg-system-background-alt p-6 transition-all',
        'hover:border-key-color-primary hover:shadow-lg'
      )}
    >
      {/* 신규 강사 배지 */}
      {teacher.isNewTeacher && (
        <div className="from-key-color-primary to-orange-scale-orange-60 font-caption-heading text-text-reversed-main absolute top-4 right-4 z-10 rounded-full bg-gradient-to-r px-3 py-1 shadow-md">
          NEW
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* 프로필 이미지 */}
        <div className="from-orange-scale-orange-10 to-orange-scale-orange-30 mb-4 h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br">
          {teacher.profileImageUrl ? (
            <Image
              src={teacher.profileImageUrl}
              alt={teacher.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-orange-scale-orange-50 flex h-full w-full items-center justify-center text-3xl">
              {teacher.name.charAt(0)}
            </div>
          )}
        </div>

        {/* 이름 */}
        <h3 className="font-headline2-heading text-text-main mb-2">
          {teacher.name} 선생님
        </h3>

        {/* 전문 분야 */}
        {teacher.specialties && teacher.specialties.length > 0 && (
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {teacher.specialties.slice(0, 3).map((specialty, idx) => (
              <span
                key={idx}
                className="bg-background-orange font-caption-heading text-key-color-primary rounded-full px-3 py-1"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        {/* 소개 */}
        {teacher.bio && (
          <p className="font-label-normal text-text-sub1 mb-4 line-clamp-2">
            {teacher.bio}
          </p>
        )}

        {/* 통계 */}
        <div className="border-line-line1 flex w-full items-center justify-around border-t pt-4">
          <div className="text-center">
            <div className="font-body1-heading text-text-main">
              {teacher.studyRoomCount}
            </div>
            <div className="font-caption-normal text-text-sub2">스터디룸</div>
          </div>
          {teacher.rating !== undefined && (
            <div className="text-center">
              <div className="font-body1-heading text-text-main">
                {teacher.rating.toFixed(1)} ⭐
              </div>
              <div className="font-caption-normal text-text-sub2">
                {teacher.reviewCount || 0}개 리뷰
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

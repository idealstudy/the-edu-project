'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/shared/lib';

import { PublicStudyRoom } from '../types/teacher.types';

interface StudyRoomCardProps {
  studyRoom: PublicStudyRoom;
}

export const StudyRoomCard = ({ studyRoom }: StudyRoomCardProps) => {
  return (
    <Link
      href={`/study-rooms/${studyRoom.id}`}
      className={cn(
        'group border-line-line1 relative overflow-hidden rounded-xl border',
        'bg-system-background-alt transition-all',
        'hover:border-key-color-primary hover:shadow-md'
      )}
    >
      {/* 스터디룸 이미지 */}
      <div className="from-orange-scale-orange-10 to-orange-scale-orange-30 aspect-video w-full overflow-hidden bg-gradient-to-br">
        {studyRoom.studyRoomImageUrl ? (
          <Image
            src={studyRoom.studyRoomImageUrl}
            alt={studyRoom.name}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            📚
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        {/* 강사 정보 */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            {studyRoom.teacherProfileImageUrl ? (
              <Image
                src={studyRoom.teacherProfileImageUrl}
                alt={studyRoom.teacherName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                {studyRoom.teacherName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-label-heading text-text-main">
              {studyRoom.teacherName} 선생님
            </div>
            {studyRoom.subjectType && (
              <div className="font-caption-normal text-text-sub2">
                {studyRoom.subjectType}
              </div>
            )}
          </div>
        </div>

        {/* 스터디룸 정보 */}
        <div>
          <h4 className="font-body1-heading text-text-main mb-2">
            {studyRoom.name}
          </h4>
          <p className="font-label-normal text-text-sub1 mb-3 line-clamp-2">
            {studyRoom.description}
          </p>
        </div>

        {/* 통계 */}
        <div className="font-caption-normal text-text-sub2 flex items-center gap-4">
          {studyRoom.studentCount !== undefined && (
            <span>👥 {studyRoom.studentCount}명</span>
          )}
          {studyRoom.grade && <span>📚 {studyRoom.grade}</span>}
        </div>
      </div>
    </Link>
  );
};

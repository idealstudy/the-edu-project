'use client';

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
        'border-gray-scale-gray-10 overflow-hidden rounded-2xl border-[1.5px] bg-white transition-all duration-300',
        'hover:scale-105 hover:shadow-xl'
      )}
    >
      {/* 상단 영역 */}
      <div className="bg-orange-scale-orange-1 flex flex-col gap-[10px] p-6">
        <h3 className="font-body1-heading text-gray-scale-gray-95 line-clamp-1">
          {studyRoom.name}
        </h3>
        <p className="font-body2-normal text-gray-scale-gray-70 line-clamp-2 min-h-[50px]">
          {studyRoom.description}
        </p>
      </div>

      {/* 하단 영역 */}
      <div className="border-gray-scale-gray-10 border-t-[1. flex flex-col gap-[8px] border-t-0 bg-white p-6">
        <div className="font-label-heading bg-orange-scale-orange-5 text-orange-scale-orange-50 flex h-[24px] w-fit items-center justify-center rounded-[4px] px-[8px] text-[12px]">
          영어
        </div>
        <div className="font-body1-heading text-gray-scale-gray-95 line-clamp-1">
          {studyRoom.teacherName} 선생님
        </div>
      </div>
    </Link>
  );
};

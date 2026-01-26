'use client';

import { useState } from 'react';

import {
  usePublicStudyRoomsQuery,
  usePublicTeachersQuery,
} from '@/features/teachers/api/teacher.public.query';
import { StudyRoomCard } from '@/features/teachers/components/study-room-card';
import { TeacherCard } from '@/features/teachers/components/teacher-card';
import { Button } from '@/shared/components/ui/button';

type SortOption = 'NEWEST' | 'OLDEST' | 'ALPHABETICAL';

export default function TeachersPage() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'studyRooms'>(
    'teachers'
  );
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  const { data: teachersData, isLoading: isLoadingTeachers } =
    usePublicTeachersQuery({
      page: 0,
      size: 20,
      sort: sortBy,
      // TODO: isNewTeacher 필터링 지원 (TBD)
    });

  const { data: studyRoomsData, isLoading: isLoadingRooms } =
    usePublicStudyRoomsQuery({
      page: 0,
      size: 20,
      sort: sortBy,
    });

  return (
    <div className="bg-system-background min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="font-title-heading text-text-main mb-4">디에듀 101</h1>
          <p className="font-body1-normal text-text-sub1">
            최근 가입한 선생님들의 프로필과 스터디룸을 확인해보세요
          </p>
        </div>

        {/* 탭 */}
        <div className="mb-8 flex justify-center gap-4">
          <Button
            onClick={() => setActiveTab('teachers')}
            variant={activeTab === 'teachers' ? 'primary' : 'outlined'}
            size="medium"
          >
            강사 프로필
          </Button>
          <Button
            onClick={() => setActiveTab('studyRooms')}
            variant={activeTab === 'studyRooms' ? 'primary' : 'outlined'}
            size="medium"
          >
            스터디룸 목록
          </Button>
        </div>

        {/* 정렬 옵션 */}
        <div className="mb-6 flex justify-end gap-2">
          <Button
            onClick={() => setSortBy('NEWEST')}
            variant={sortBy === 'NEWEST' ? 'primary' : 'outlined'}
            size="xsmall"
          >
            최신순
          </Button>
          <Button
            onClick={() => setSortBy('OLDEST')}
            variant={sortBy === 'OLDEST' ? 'primary' : 'outlined'}
            size="xsmall"
          >
            오래된순
          </Button>
          <Button
            onClick={() => setSortBy('ALPHABETICAL')}
            variant={sortBy === 'ALPHABETICAL' ? 'primary' : 'outlined'}
            size="xsmall"
          >
            가나다순
          </Button>
        </div>

        {/* 콘텐츠 */}
        {activeTab === 'teachers' ? (
          <div>
            {isLoadingTeachers ? (
              <div className="font-body2-normal text-text-sub2 py-12 text-center">
                로딩 중...
              </div>
            ) : teachersData?.content && teachersData.content.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teachersData.content.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                  />
                ))}
              </div>
            ) : (
              <div className="font-body2-normal text-text-sub2 py-12 text-center">
                신규 강사가 아직 없습니다.
              </div>
            )}
          </div>
        ) : (
          <div>
            {isLoadingRooms ? (
              <div className="font-body2-normal text-text-sub2 py-12 text-center">
                로딩 중...
              </div>
            ) : studyRoomsData?.content && studyRoomsData.content.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studyRoomsData.content.map((room) => (
                  <StudyRoomCard
                    key={room.id}
                    studyRoom={room}
                  />
                ))}
              </div>
            ) : (
              <div className="font-body2-normal text-text-sub2 py-12 text-center">
                공개된 스터디룸이 아직 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

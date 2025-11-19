'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useDashboardQuery } from '@/features/dashboard';
import { useTeacherStudyRoomsQuery } from '@/features/study-rooms';
import { HomeIcon, PlusIcon, SettingIcon } from '@/shared/components/icons';
import { Sidebar } from '@/shared/components/sidebar';
import { PRIVATE } from '@/shared/constants/route';

export const DashboardSidebar = () => {
  // [CRITICAL TODO: API 구현 누락] useDashboardQuery의 데이터(data)를 사용할 수 있도록 백엔드 API 및 바인딩 작업을 즉시 진행해야 합니다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, isLoading, isError } = useDashboardQuery();

  /* ─────────────────────────────────────────────────────
   * TEMPORARY : 현재는 스터디룸 API를 이용하지만 추후 위의 useDashboardQuery 필요 예상
   * ────────────────────────────────────────────────────*/
  const { data: studyRoomList } = useTeacherStudyRoomsQuery({
    enabled: true,
  });

  return (
    <Sidebar>
      {/* 홈 */}
      <Sidebar.Item href={PRIVATE.DASHBOARD.INDEX}>
        <HomeIcon />
        <Sidebar.Text>홈</Sidebar.Text>
      </Sidebar.Item>

      <Sidebar.Header>
        <div className="flex items-center gap-2">
          <Sidebar.SectionIcon />
          <Sidebar.HeaderText>스터디룸</Sidebar.HeaderText>
        </div>
        <Sidebar.Item
          href={PRIVATE.ROOM.CREATE}
          className="h-9 w-9 justify-center bg-transparent px-0"
        >
          <PlusIcon />
          <span className="sr-only">스터디룸 생성</span>
        </Sidebar.Item>
      </Sidebar.Header>

      <Sidebar.List>
        {studyRoomList?.map((item) => (
          <Sidebar.ListItem
            key={item.id}
            item={{
              id: item.id,
              text: item.name,
            }}
          />
        ))}
      </Sidebar.List>

      <Sidebar.Item href={PRIVATE.DASHBOARD.SETTINGS}>
        <SettingIcon />
        <Sidebar.Text>환경설정</Sidebar.Text>
      </Sidebar.Item>

      <div className="absolute right-0 bottom-0 p-4">
        <Link
          href={PRIVATE.DASHBOARD.INQUIRY}
          className="text-gray-scale-gray-50 hover:bg-gray-scale-gray-5 flex items-center gap-2 rounded-lg text-[14px] font-semibold"
        >
          <Sidebar.Text>디에듀에 문의하기</Sidebar.Text>
          <Image
            src="/ic_question_mark.svg"
            alt="디에듀에 문의하기 아이콘"
            width={16}
            height={16}
          />
        </Link>
      </div>
    </Sidebar>
  );
};

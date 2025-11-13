'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HomeIcon, PlusIcon, SettingIcon } from '@/shared/components/icons';
import { Sidebar } from '@/shared/components/sidebar';
import { ROUTE } from '@/shared/constants/route';

/* ─────────────────────────────────────────────────────
 * 더미 데이터: 실제에선 서버/쿼리로 대체
 * ────────────────────────────────────────────────────*/
const studyRoomList = [
  { id: 1, text: '나의 첫 스터디룸...' },
  { id: 2, text: '은광여고 여름방학 특강반...' },
  { id: 3, text: '오버플로우 확인용 오버플로우 확인용' },
];

export const DashboardSidebar = () => {
  return (
    <Sidebar>
      {/* 홈 */}
      <Sidebar.Item href={ROUTE.DASHBOARD.HOME}>
        <HomeIcon />
        <Sidebar.Text>홈</Sidebar.Text>
      </Sidebar.Item>

      <Sidebar.Header>
        <div className="flex items-center gap-2">
          <Sidebar.SectionIcon />
          <Sidebar.HeaderText>스터디룸</Sidebar.HeaderText>
        </div>
        <Sidebar.Item
          href={ROUTE.DASHBOARD.STUDYROOM.CREATE}
          className="h-9 w-9 justify-center bg-transparent px-0"
        >
          <PlusIcon />
          <span className="sr-only">스터디룸 생성</span>
        </Sidebar.Item>
      </Sidebar.Header>

      <Sidebar.List>
        {studyRoomList.map((item) => (
          <Sidebar.ListItem
            key={item.id}
            item={item}
          />
        ))}
      </Sidebar.List>

      <Sidebar.Item href={ROUTE.DASHBOARD.SETTINGS}>
        <SettingIcon />
        <Sidebar.Text>환경설정</Sidebar.Text>
      </Sidebar.Item>

      <div className="absolute right-0 bottom-0 p-4">
        <Link
          href={ROUTE.DASHBOARD.SETTINGS}
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

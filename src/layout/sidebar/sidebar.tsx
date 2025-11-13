'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  HomeIcon,
  ListIcon,
  PlusIcon,
  SettingIcon,
  TextIcon,
} from '@/shared/components/icons';
import { ROUTE } from '@/shared/constants/route';
import { cn } from '@/shared/lib';

/* 더미 데이터: 실제에선 서버/쿼리로 대체 */
const studyRoomList = [
  {
    id: 1,
    text: '나의 첫 스터디룸나의 첫 스터디룸나의 첫 스터디룸나의 첫 스터디룸나의 첫 스터디룸',
  },
  {
    id: 2,
    text: '은광여고 여름방학 특강반나의 첫 스터디룸나의 첫 스터디룸나의 첫 스터디룸나의 첫 스터디룸나의 첫 스터디룸',
  },
  { id: 3, text: '오버플로우 확인용 오버플로우 확인용' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const isStudyRoomActive = pathname?.startsWith('/dashboard/study-rooms');

  return (
    <div
      className={cn(
        'top-header-height fixed left-0 hidden h-[calc(100dvh-var(--spacing-header-height))] flex-col py-3',
        'desktop:flex'
      )}
    >
      <aside className="bg-system-background-alt w-sidebar-width relative flex-1 flex-col overflow-y-auto rounded-r-[12px] border-y border-r border-[#D9D9D9] p-3">
        <nav className="flex h-full flex-1 flex-col">
          {/* 홈 */}
          <SidebarItem href={ROUTE.DASHBOARD.HOME}>
            <HomeIcon />
            <SidebarItemText>홈</SidebarItemText>
          </SidebarItem>

          {/* 스터디룸 헤더 + 생성 버튼 */}
          <div className="flex h-[58px] w-full items-center justify-between pr-[10px] pl-5">
            <div className="flex items-center gap-2">
              <TextIcon
                className={cn(isStudyRoomActive && 'text-key-color-primary')}
              />
              <p
                className={cn(
                  'pointer-events-none font-bold select-none',
                  isStudyRoomActive && 'text-key-color-primary'
                )}
              >
                스터디룸
              </p>
            </div>
            <SidebarItem
              href={ROUTE.DASHBOARD.STUDYROOM.CREATE}
              className="h-9 w-9 justify-center bg-transparent px-0"
            >
              <PlusIcon />
              <span className="sr-only">스터디룸 생성</span>
            </SidebarItem>
          </div>

          {/* 스터디룸 리스트 */}
          <ul className="flex flex-col">
            {studyRoomList.map((item) => {
              const detailHref = ROUTE.DASHBOARD.STUDYROOM.DETAIL(item.id);
              const isActive = pathname === detailHref;

              return (
                <li key={item.id}>
                  <SidebarItem
                    href={detailHref}
                    className="h-12 items-center justify-start gap-[2px]"
                  >
                    <ListIcon
                      className={cn(
                        'StudyRoomListIcon ml-[2px] shrink-0',
                        isActive && 'text-key-color-primary'
                      )}
                    />
                    <SidebarItemText className="font-body2-normal max-w-[173px] shrink-0 truncate text-left">
                      <span title={item.text}>{item.text}</span>
                    </SidebarItemText>
                  </SidebarItem>
                </li>
              );
            })}
          </ul>

          {/* 환경설정 */}
          <SidebarItem href={ROUTE.DASHBOARD.SETTINGS}>
            <SettingIcon />
            <SidebarItemText>환경설정</SidebarItemText>
          </SidebarItem>

          {/* 하단 고정: 문의하기 */}
          <div className="absolute right-0 bottom-0 p-4">
            <Link
              href={ROUTE.DASHBOARD.SETTINGS}
              className="text-gray-scale-gray-50 hover:bg-gray-scale-gray-5 flex items-center gap-2 rounded-lg text-[14px] font-semibold"
            >
              <SidebarItemText>디에듀에 문의하기</SidebarItemText>
              <Image
                src="/ic_question_mark.svg"
                alt="디에듀에 문의하기 아이콘"
                width={16}
                height={16}
              />
            </Link>
          </div>
        </nav>
      </aside>
    </div>
  );
};

type SidebarItemProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const SidebarItem = ({ href, children, className }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const isCreatePage = href === ROUTE.DASHBOARD.STUDYROOM.CREATE;

  return (
    <Link
      href={href}
      className={cn(
        'flex h-[58px] items-center gap-2 rounded-lg px-5 font-bold',
        isActive
          ? 'text-key-color-primary bg-[#FFF4F1]'
          : 'hover:bg-gray-scale-gray-5',
        isCreatePage && 'h-9 w-9 justify-center gap-0 bg-transparent px-0',
        className
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

const SidebarItemText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <span className={cn('relative', className)}>{children}</span>;
};

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTeacherDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-teacher-dashboard-query';
import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import {
  ClipboardListIcon,
  Home,
  MessageCircle,
  Newspaper,
  NotebookText,
  School,
  Search,
  UserRound,
} from 'lucide-react';

import { StudentBottomNavigation } from './student/student-bottom-navigation';

type RoleBottomNavigationProps = {
  role?: string | null;
};

type TeacherBottomNavigationViewProps = {
  pathname: string;
  primaryRoomId?: number;
};

type NavigationItem = {
  label: string;
  href: string;
  match: RegExp;
  icon: typeof Home;
};

const TEACHER_BASE_ITEMS: NavigationItem[] = [
  {
    label: '내 수업',
    href: PRIVATE.DASHBOARD.TEACHER,
    match: /^\/dashboard\/teacher\/?$/,
    icon: ClipboardListIcon,
  },
  {
    label: '마이페이지',
    href: PRIVATE.DASHBOARD.TEACHER_MY,
    match: /^\/dashboard\/teacher\/my\/?$/,
    icon: UserRound,
  },
];

const PARENT_ITEMS: NavigationItem[] = [
  {
    label: '홈',
    href: PRIVATE.DASHBOARD.PARENT,
    match: /^\/dashboard\/parent\/?$/,
    icon: Home,
  },
  {
    label: '학습 소식',
    href: PRIVATE.DASHBOARD.PARENT_STUDY_NEWS,
    match: /^\/dashboard\/study-news\/?$/,
    icon: Newspaper,
  },
  {
    label: '스터디룸 기록일지',
    href: PRIVATE.DASHBOARD.PARENT_STUDY_RECORDS,
    match: /^\/dashboard\/study-consultation\/?$/,
    icon: NotebookText,
  },
  {
    label: '스터디룸 둘러보기',
    href: PRIVATE.DASHBOARD.PARENT_STUDY_ROOMS,
    match: /^\/list\/study-rooms\/?$/,
    icon: Search,
  },
  {
    label: '상담 내역',
    href: PRIVATE.DASHBOARD.PARENT_CONSULTATIONS,
    match: /^\/dashboard\/parent(?:\?.*)?#parent-consultations$/,
    icon: MessageCircle,
  },
  {
    label: '마이페이지',
    href: PRIVATE.MYPAGE,
    match: /^\/mypage\/?$/,
    icon: UserRound,
  },
];

const BottomNavigationItems = ({
  items,
  pathname,
}: {
  items: NavigationItem[];
  pathname: string;
}) =>
  items.map((item) => {
    const active = item.match.test(pathname);
    const Icon = item.icon;

    return (
      <Link
        key={item.label}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'min-h-control-xl gap-inline-gap-xs active:bg-orange-1 flex min-w-0 flex-col items-center justify-center px-0.5 text-center text-xs font-bold transition-[color,background-color,opacity,transform] duration-100 active:opacity-90',
          active ? 'text-orange-9' : 'text-gray-8'
        )}
      >
        <Icon
          size={18}
          aria-hidden
          className="shrink-0"
        />
        <b
          aria-hidden="true"
          className="text-two-lines leading-tight"
        >
          {item.label}
        </b>
      </Link>
    );
  });

export const TeacherBottomNavigationView = ({
  pathname,
  primaryRoomId,
}: TeacherBottomNavigationViewProps) => {
  const roomItem: NavigationItem | null = primaryRoomId
    ? {
        label: '스터디룸',
        href: PRIVATE.ROOM.DETAIL(primaryRoomId),
        match: /^\/study-rooms\/\d+(?:\/.*)?$/,
        icon: School,
      }
    : null;
  const items = roomItem
    ? [TEACHER_BASE_ITEMS[0]!, roomItem, TEACHER_BASE_ITEMS[1]!]
    : TEACHER_BASE_ITEMS;

  return (
    <nav
      aria-label="선생님 모바일 주요 메뉴"
      className={cn(
        'border-gray-3 bg-gray-white min-h-control-xl tablet:hidden fixed right-0 bottom-0 left-0 z-(--z-layer-chrome) grid border-t pb-[env(safe-area-inset-bottom)]',
        roomItem ? 'grid-cols-3' : 'grid-cols-2'
      )}
      data-testid="teacher-bottom-navigation"
    >
      <BottomNavigationItems
        items={items}
        pathname={pathname}
      />
    </nav>
  );
};

export const TeacherBottomNavigation = () => {
  const pathname = usePathname() ?? '';
  const rooms = useTeacherDashboardStudyRoomListQuery();

  return (
    <TeacherBottomNavigationView
      pathname={pathname}
      primaryRoomId={rooms.data?.[0]?.id}
    />
  );
};

export const ParentBottomNavigation = () => {
  const pathname = usePathname() ?? '';

  return (
    <nav
      aria-label="학부모 모바일 주요 메뉴"
      className="border-gray-3 bg-gray-white min-h-control-xl tablet:hidden fixed right-0 bottom-0 left-0 z-(--z-layer-chrome) grid grid-cols-6 border-t pb-[env(safe-area-inset-bottom)]"
      data-testid="parent-bottom-navigation"
    >
      <BottomNavigationItems
        items={PARENT_ITEMS}
        pathname={pathname}
      />
    </nav>
  );
};

export const RoleBottomNavigation = ({ role }: RoleBottomNavigationProps) => {
  if (role === 'ROLE_STUDENT') return <StudentBottomNavigation />;
  if (role === 'ROLE_TEACHER') return <TeacherBottomNavigation />;
  if (role === 'ROLE_PARENT') return <ParentBottomNavigation />;
  return null;
};

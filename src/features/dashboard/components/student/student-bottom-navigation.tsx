'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import {
  BookOpenCheck,
  GraduationCap,
  Handshake,
  UserRound,
  Wallet,
} from 'lucide-react';

const ITEMS = [
  {
    label: '학습',
    href: PRIVATE.DASHBOARD.STUDENT,
    match: /^\/dashboard\/student\/?$/,
    icon: GraduationCap,
  },
  {
    label: '친구',
    href: PRIVATE.FRIENDS.INDEX,
    match: /^\/friends(?:\/.*)?$/,
    icon: Handshake,
  },
  {
    label: '오답',
    href: PRIVATE.DASHBOARD.WRONG_ANSWERS,
    match: /^\/dashboard\/student\/wrong-answers(?:\/.*)?$/,
    icon: BookOpenCheck,
  },
  {
    label: '포인트',
    href: PRIVATE.POINTS.INDEX,
    match: /^\/points\/?$/,
    icon: Wallet,
  },
  {
    label: '마이',
    href: PRIVATE.MYPAGE,
    match: /^\/mypage\/?$/,
    icon: UserRound,
  },
] as const;

export const StudentBottomNavigation = () => {
  const pathname = usePathname() ?? '';

  return (
    <nav
      aria-label="학생 모바일 주요 메뉴"
      className="border-gray-3 bg-gray-white min-h-control-xl fixed right-0 bottom-0 left-0 z-(--z-layer-chrome) grid grid-cols-5 border-t md:hidden"
      data-testid="student-bottom-navigation"
    >
      {ITEMS.map((item) => {
        const active = item.match.test(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'min-h-control-xl gap-inline-gap-xs text-ui-compact flex flex-col items-center justify-center font-bold',
              active ? 'text-orange-9' : 'text-gray-8'
            )}
          >
            <Icon
              size={18}
              aria-hidden
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

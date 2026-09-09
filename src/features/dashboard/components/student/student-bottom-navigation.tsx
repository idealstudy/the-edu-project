'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PRIVATE } from '@/shared/constants';
import { cn } from '@/shared/lib';
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  GraduationCap,
  History,
  UserRound,
} from 'lucide-react';

const ITEMS = [
  {
    label: '내 학습',
    shortLabel: '학습',
    href: PRIVATE.DASHBOARD.STUDENT,
    match: /^\/dashboard\/student\/?$/,
    icon: GraduationCap,
  },
  {
    label: '내 성과',
    shortLabel: '성과',
    href: PRIVATE.DASHBOARD.STUDENT_RESULTS,
    match: /^\/dashboard\/student\/results\/?$/,
    icon: ChartNoAxesCombined,
  },
  {
    label: '돌아보기',
    shortLabel: '회고',
    href: PRIVATE.DASHBOARD.STUDENT_LOOK_BACK,
    match: /^\/dashboard\/student\/look-back\/?$/,
    icon: History,
  },
  {
    label: '오답 회독',
    shortLabel: '오답',
    href: PRIVATE.DASHBOARD.WRONG_ANSWERS,
    match: /^\/dashboard\/student\/wrong-answers(?:\/.*)?$/,
    icon: BookOpenCheck,
  },
  {
    label: '마이페이지',
    shortLabel: '나',
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
      className="border-gray-3 bg-gray-white min-h-control-xl fixed right-0 bottom-0 left-0 z-(--z-layer-chrome) grid grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
      data-testid="student-bottom-navigation"
    >
      {ITEMS.map((item) => {
        const active = item.match.test(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
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
            <span aria-hidden="true">
              <b className="block leading-none">{item.shortLabel}</b>
              <small className="mt-0.5 block leading-none font-semibold">
                {item.label}
              </small>
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

'use client';

import { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PRIVATE } from '@/shared/constants/route';
import { cn } from '@/shared/lib';
import { useMemberStore } from '@/store';

import { useAdminSummary } from '../hooks/use-admin-operations';

const menu = [
  ['●', '회원 관리', PRIVATE.ADMIN.MEMBERS.LIST],
  ['▣', '수업 전체', PRIVATE.ADMIN.STUDY_ROOMS],
  ['◈', '공개 응시장', PRIVATE.ADMIN.PUBLIC_EXAMS],
  ['◆', '문제은행', PRIVATE.ADMIN.QUESTION_BANK],
  ['◇', '문의와 상담', PRIVATE.ADMIN.CONSULTATIONS],
] as const;

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const member = useMemberStore((state) => state.member);
  const summary = useAdminSummary();
  const profileDetail = [member?.name, member?.email]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="desktop:-ml-sidebar-width flex min-h-[calc(100dvh-60px)] bg-[#f7f7f8]"
      data-admin-shell
    >
      <aside className="hidden w-[186px] shrink-0 border-r border-[#e4e4e7] bg-white px-3 py-4 md:block">
        <div className="px-2 pt-1 pb-3 text-sm font-extrabold tracking-[-0.045em] text-[#9a3412]">
          D-EDU
          <small className="mt-0.5 block text-[9.5px] font-semibold tracking-normal text-[#71717a]">
            관리자
          </small>
        </div>
        <nav aria-label="관리자 메뉴">
          {menu.map(([icon, label, href]) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-[12.5px] font-semibold text-[#3f3f46]',
                  active && 'bg-[#fff7ed] font-extrabold text-[#9a3412]'
                )}
              >
                <span className="w-[15px] text-center text-[11px]">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-[66px] items-center gap-2 border-b border-[#e4e4e7] bg-white px-4 md:px-[22px]">
          <span className="grid size-8 place-items-center rounded-full bg-[#f4f4f5] text-xs font-extrabold text-[#3f3f46]">
            {member?.name?.slice(0, 1) ?? ''}
          </span>
          <div className="text-[13.5px] font-extrabold text-[#27272a]">
            관리자
            {profileDetail ? (
              <small className="block text-[10.5px] font-semibold text-[#71717a]">
                {profileDetail}
              </small>
            ) : null}
          </div>
          <div className="ml-auto flex gap-3 text-right md:gap-4">
            <div>
              <div className="text-[10px] font-bold text-[#71717a]">
                전체 회원
              </div>
              <div className="text-sm font-extrabold text-[#27272a] tabular-nums">
                {summary.data
                  ? `${summary.data.totalMemberCount.toLocaleString()}명`
                  : ''}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#71717a]">
                최근 7일 가입
              </div>
              <div className="text-sm font-extrabold text-[#27272a] tabular-nums">
                {summary.data
                  ? `${summary.data.newMemberCount.toLocaleString()}명`
                  : ''}
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

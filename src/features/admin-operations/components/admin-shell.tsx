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
      className="bg-system-background -0 flex min-h-dvh"
      data-admin-shell
    >
      <aside className="border-gray-3 -0 hidden shrink-0 border-r bg-white px-3 py-4 md:block">
        <div className="text-orange-11 px-2 pt-1 pb-3 text-sm font-extrabold tracking-[-0.045em]">
          D-EDU
          <small className="text-gray-8 text-ui-compact mt-0.5 block font-semibold tracking-normal">
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
                  'text-gray-11 flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold',
                  active && 'bg-orange-1 text-orange-11 font-extrabold'
                )}
              >
                <span className="-0 text-ui-choice text-center">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-gray-3 -0 -0 flex items-center gap-2 border-b bg-white px-4">
          <span className="bg-gray-1 text-gray-11 grid size-8 place-items-center rounded-full text-xs font-extrabold">
            {member?.name?.slice(0, 1) ?? ''}
          </span>
          <div className="text-gray-12 text-coach font-extrabold">
            관리자
            {profileDetail ? (
              <small className="text-gray-8 text-ui-compact block font-semibold">
                {profileDetail}
              </small>
            ) : null}
          </div>
          <div className="ml-auto flex gap-3 text-right md:gap-4">
            <div>
              <div className="text-gray-8 text-ui-compact font-bold">
                전체 회원
              </div>
              <div className="text-gray-12 text-sm font-extrabold tabular-nums">
                {summary.data
                  ? `${summary.data.totalMemberCount.toLocaleString()}명`
                  : ''}
              </div>
            </div>
            <div>
              <div className="text-gray-8 text-ui-compact font-bold">
                최근 7일 가입
              </div>
              <div className="text-gray-12 text-sm font-extrabold tabular-nums">
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

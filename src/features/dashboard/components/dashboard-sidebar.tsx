'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  HomeIcon,
  ListIcon,
  NotepadIcon,
} from '@/shared/components/icons';
import { Sidebar } from '@/shared/components/sidebar';
import { PRIVATE, PUBLIC } from '@/shared/constants/route';
import { useRole } from '@/shared/hooks/use-role';
import { trackGnbLogoutClick } from '@/shared/lib/analytics';
import {
  Flame,
  GraduationCap,
  LogOut,
  ShieldUserIcon,
  Sprout,
  User2Icon,
  Wallet,
} from 'lucide-react';

export const DashboardSidebar = () => {
  const { role } = useRole();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    trackGnbLogoutClick(role ?? null);
  };

  return (
    <Sidebar>
      {/* 대시보드 */}
      <Sidebar.Item
        href={PRIVATE.DASHBOARD.INDEX}
        matchPath={PRIVATE.DASHBOARD.INDEX}
      >
        <HomeIcon />
        <Sidebar.Text>대시보드</Sidebar.Text>
      </Sidebar.Item>

      {/* 내 학습 (2.0 학생 1순위 — 약점 트리·포인트·내 문제 허브) */}
      <Sidebar.Item
        href={PRIVATE.LEARNING.INDEX}
        matchPath={PRIVATE.LEARNING.INDEX}
      >
        <GraduationCap
          size={20}
          className="shrink-0"
        />
        <Sidebar.Text>내 학습</Sidebar.Text>
      </Sidebar.Item>

      {/* 오픈챌린지 (2.0 학생 중심 코어) */}
      <Sidebar.Item
        href={PUBLIC.OPEN_CHALLENGE.LIST}
        matchPath={PUBLIC.OPEN_CHALLENGE.LIST}
      >
        <Flame
          size={20}
          className="shrink-0"
        />
        <Sidebar.Text>오픈챌린지</Sidebar.Text>
      </Sidebar.Item>

      {/* 약점 트리 (2.0 학생 중심 코어) */}
      <Sidebar.Item
        href={PRIVATE.TREE.INDEX}
        matchPath={PRIVATE.TREE.INDEX}
      >
        <Sprout
          size={20}
          className="shrink-0"
        />
        <Sidebar.Text>약점 트리</Sidebar.Text>
      </Sidebar.Item>

      {/* 포인트 지갑 (2.0 학생 중심 코어 — 소모 화폐) */}
      <Sidebar.Item
        href={PRIVATE.POINTS.INDEX}
        matchPath={PRIVATE.POINTS.INDEX}
      >
        <Wallet
          size={20}
          className="shrink-0"
        />
        <Sidebar.Text>포인트</Sidebar.Text>
      </Sidebar.Item>

      {role === 'ROLE_ADMIN' && (
        <>
          <Sidebar.Header>
            <div className="flex items-center gap-2">
              <ShieldUserIcon />
              <Sidebar.HeaderText>관리자</Sidebar.HeaderText>
            </div>
          </Sidebar.Header>

          <Sidebar.List>
            <li>
              <Sidebar.Item
                href={PRIVATE.ADMIN.COLUMN.LIST}
                matchPath={PRIVATE.ADMIN.COLUMN.LIST}
                className="h-12 items-center justify-start gap-[2px]"
              >
                <ListIcon />
                <Sidebar.Text className="font-body2-normal">
                  칼럼 관리
                </Sidebar.Text>
              </Sidebar.Item>
            </li>
            <li>
              <Sidebar.Item
                href={PRIVATE.ADMIN.OPEN_CHALLENGE.LIST}
                matchPath={PRIVATE.ADMIN.OPEN_CHALLENGE.LIST}
                className="h-12 items-center justify-start gap-[2px]"
              >
                <ListIcon />
                <Sidebar.Text className="font-body2-normal">
                  오픈챌린지 관리
                </Sidebar.Text>
              </Sidebar.Item>
            </li>
          </Sidebar.List>
        </>
      )}

      <Sidebar.Item
        href={PUBLIC.COMMUNITY.COLUMN.LIST}
        matchPath={PUBLIC.COMMUNITY.BASE}
      >
        <NotepadIcon className="shrink-0" />
        <Sidebar.Text>게시판</Sidebar.Text>
      </Sidebar.Item>

      <Sidebar.Item
        href={PRIVATE.MYPAGE}
        matchPath={PRIVATE.MYPAGE}
      >
        <User2Icon className="shrink-0" />
        <Sidebar.Text>마이페이지</Sidebar.Text>
      </Sidebar.Item>

      <div className="mt-auto flex justify-end p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="text-text-sub2 hover:bg-background-gray font-body2-normal flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1"
        >
          <Sidebar.Text>로그아웃</Sidebar.Text>
          <LogOut size={20} />
        </button>
      </div>
    </Sidebar>
  );
};

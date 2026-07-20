'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { ListIcon } from '@/shared/components/icons';
import { Sidebar } from '@/shared/components/sidebar';
import { PRIVATE } from '@/shared/constants/route';
import { useRole } from '@/shared/hooks/use-role';
import { trackGnbLogoutClick } from '@/shared/lib/analytics';
import {
  ClipboardListIcon,
  GraduationCap,
  Handshake,
  LogOut,
  MessageCircleQuestionIcon,
  ShieldUserIcon,
  Sprout,
  User2Icon,
  Users,
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
      {/* 학생 전용: 내 학습 / 친구 / 약점 트리 (2.0 학생 중심 코어) — 선생님·학부모 화면 아님 */}
      {role === 'ROLE_STUDENT' && (
        <>
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

          <Sidebar.Item
            href={PRIVATE.FRIENDS.INDEX}
            matchPath={PRIVATE.FRIENDS.INDEX}
          >
            <Handshake
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>친구</Sidebar.Text>
          </Sidebar.Item>

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
        </>
      )}

      {/* 선생님 전용: 스터디 관리 / Q&A 관리 — 학생이 맡던 자리에 선생님 업무 도구 배치 */}
      {role === 'ROLE_TEACHER' && (
        <>
          <Sidebar.Item
            href={PRIVATE.DASHBOARD.TEACHER}
            matchPath={PRIVATE.DASHBOARD.TEACHER}
          >
            <ClipboardListIcon
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>스터디 관리</Sidebar.Text>
          </Sidebar.Item>

          <Sidebar.Item
            href={PRIVATE.DASHBOARD.QNA}
            matchPath={PRIVATE.DASHBOARD.QNA}
          >
            <MessageCircleQuestionIcon
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>Q&A 관리</Sidebar.Text>
          </Sidebar.Item>
        </>
      )}

      {/* 마이페이지 */}
      <Sidebar.Item
        href={PRIVATE.MYPAGE}
        matchPath={PRIVATE.MYPAGE}
      >
        <User2Icon className="shrink-0" />
        <Sidebar.Text>마이페이지</Sidebar.Text>
      </Sidebar.Item>

      {/* 자녀 학습 (학부모 전용 — 자녀 목록·학습 리포트) */}
      {role === 'ROLE_PARENT' && (
        <Sidebar.Item
          href={PRIVATE.PARENT.INDEX}
          matchPath={PRIVATE.PARENT.INDEX}
        >
          <Users
            size={20}
            className="shrink-0"
          />
          <Sidebar.Text>자녀 학습</Sidebar.Text>
        </Sidebar.Item>
      )}

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

'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useStudentDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-student-dashboard-query';
import { ListIcon } from '@/shared/components/icons';
import { Sidebar } from '@/shared/components/sidebar';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { PRIVATE } from '@/shared/constants/route';
import { useRole } from '@/shared/hooks/use-role';
import { trackGnbLogoutClick } from '@/shared/lib/analytics';
import {
  ChartNoAxesCombined,
  ClipboardListIcon,
  Diamond,
  GraduationCap,
  Handshake,
  History,
  LogOut,
  ShieldUserIcon,
  Sprout,
  User2Icon,
  Users,
} from 'lucide-react';

export const DashboardSidebar = () => {
  const { role } = useRole();
  const { logout } = useAuth();
  const studentRooms = useStudentDashboardStudyRoomListQuery({
    enabled: role === 'ROLE_STUDENT',
  });
  const primaryRoom = studentRooms.data?.[0];

  const handleLogout = () => {
    logout();
    trackGnbLogoutClick(role ?? null);
  };

  return (
    <Sidebar>
      <div className="text-orange-9 px-2 pt-1 pb-3 text-sm font-extrabold tracking-[-0.045em]">
        D-EDU
        <small className="text-gray-8 mt-0.5 block text-[9.5px] font-semibold tracking-normal">
          {role === 'ROLE_TEACHER' ? '선생님' : '내 학습'}
        </small>
      </div>
      {/* 학생 전용: 내 학습 / 친구 / 약점 트리 (2.0 학생 중심 코어) — 선생님·학부모 화면 아님 */}
      {role === 'ROLE_STUDENT' && (
        <>
          <Sidebar.Item href={PRIVATE.DASHBOARD.STUDENT}>
            <GraduationCap
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>내 학습</Sidebar.Text>
          </Sidebar.Item>

          <Sidebar.Item
            href={PRIVATE.DASHBOARD.STUDENT_RESULTS}
            matchPath={PRIVATE.DASHBOARD.STUDENT_RESULTS}
          >
            <ChartNoAxesCombined
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>내 성과</Sidebar.Text>
          </Sidebar.Item>

          <Sidebar.Item
            href={PRIVATE.DASHBOARD.STUDENT_LOOK_BACK}
            matchPath={PRIVATE.DASHBOARD.STUDENT_LOOK_BACK}
          >
            <History
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>돌아보기</Sidebar.Text>
          </Sidebar.Item>

          {primaryRoom && (
            <>
              <div className="text-gray-8 px-2 pt-4 pb-1 text-[10px] font-extrabold">
                소속
              </div>
              <Sidebar.Item
                href={PRIVATE.ROOM.DETAIL(primaryRoom.id)}
                matchPath={`/study-rooms/${primaryRoom.id}`}
              >
                <ClipboardListIcon
                  size={20}
                  className="shrink-0"
                />
                <Sidebar.Text className="truncate">
                  {primaryRoom.name}
                </Sidebar.Text>
              </Sidebar.Item>
            </>
          )}

          <div className="text-gray-8 px-2 pt-4 pb-1 text-[10px] font-extrabold">
            더 보기
          </div>

          <Sidebar.Item
            href={PRIVATE.DASHBOARD.WRONG_ANSWERS}
            matchPath={PRIVATE.DASHBOARD.WRONG_ANSWERS}
          >
            <History
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>오답 회독</Sidebar.Text>
          </Sidebar.Item>

          <Sidebar.Item
            href={PRIVATE.DASHBOARD.EXAM_HALL}
            matchPath={PRIVATE.DASHBOARD.EXAM_HALL}
          >
            <Diamond
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>응시장</Sidebar.Text>
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
            href={PRIVATE.POINTS.INDEX}
            matchPath={PRIVATE.POINTS.INDEX}
          >
            <Diamond
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>포인트</Sidebar.Text>
          </Sidebar.Item>
        </>
      )}

      {/* 선생님 전역 메뉴는 내 수업과 마이페이지만 둔다. */}
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
            <Sidebar.Text>내 수업</Sidebar.Text>
          </Sidebar.Item>
        </>
      )}

      {role === 'ROLE_TEACHER' && (
        <Sidebar.Item
          href={PRIVATE.DASHBOARD.TEACHER_MY}
          matchPath={PRIVATE.DASHBOARD.TEACHER_MY}
        >
          <User2Icon className="shrink-0" />
          <Sidebar.Text>마이페이지</Sidebar.Text>
        </Sidebar.Item>
      )}

      {role !== 'ROLE_TEACHER' && (
        <Sidebar.Item
          href={PRIVATE.MYPAGE}
          matchPath={PRIVATE.MYPAGE}
        >
          <User2Icon className="shrink-0" />
          <Sidebar.Text>마이페이지</Sidebar.Text>
        </Sidebar.Item>
      )}

      {role === 'ROLE_STUDENT' && (
        <>
          <div className="text-gray-8 px-2 pt-4 pb-1 text-[10px] font-extrabold">
            오픈챌린지에서 열립니다
          </div>
          <Sidebar.Item
            href={PRIVATE.TREE.INDEX}
            matchPath={PRIVATE.TREE.INDEX}
          >
            <Sprout
              size={20}
              className="shrink-0"
            />
            <Sidebar.Text>약점 나무 ↗</Sidebar.Text>
          </Sidebar.Item>
        </>
      )}

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
                href={PRIVATE.ADMIN.MEMBERS.LIST}
                matchPath={PRIVATE.ADMIN.MEMBERS.LIST}
                className="h-12 items-center justify-start gap-[2px]"
              >
                <Users size={20} />
                <Sidebar.Text className="font-body2-normal">
                  회원 관리
                </Sidebar.Text>
              </Sidebar.Item>
            </li>
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
        <UnstyledButton
          variant="unstyled"
          size="none"
          type="button"
          onClick={handleLogout}
          className="text-text-sub2 hover:bg-background-gray font-body2-normal flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1"
        >
          <Sidebar.Text>로그아웃</Sidebar.Text>
          <LogOut size={20} />
        </UnstyledButton>
      </div>
    </Sidebar>
  );
};

import { redirect } from 'next/navigation';

import { PRIVATE } from '@/shared/constants';
import { fetchMemberRole } from '@/shared/lib';

type DashboardRole = 'ROLE_TEACHER' | 'ROLE_STUDENT' | 'ROLE_PARENT';

type DashboardRoleSession = {
  initialMemberName: string;
};

const DASHBOARD_ROLES = new Set<string>([
  'ROLE_TEACHER',
  'ROLE_STUDENT',
  'ROLE_PARENT',
]);

/**
 * 서버에서 현재 사용자의 역할별 대시보드 접근 권한을 검증합니다.
 */
export async function assertDashboardRole(
  expectedRole: DashboardRole
): Promise<DashboardRoleSession> {
  const session = await fetchMemberRole();

  if (session.status !== 'authenticated') {
    return { initialMemberName: '' };
  }

  if (session.role === expectedRole) {
    return { initialMemberName: session.name };
  }

  if (DASHBOARD_ROLES.has(session.role)) {
    redirect(PRIVATE.DASHBOARD.byRole(session.role as DashboardRole));
  }

  redirect(PRIVATE.DASHBOARD.INDEX);
}

import { ReactNode } from 'react';

import { StudentAppBar } from '@/features/dashboard/components/header/student-app-bar';
import { assertDashboardRole } from '@/shared/lib/assert-dashboard-role';

/**
 * 학생 화면 셸.
 * v22 규격 §2 앱바 호출 규칙(:1732-1744): 앱바는 셸 부품이라 모든 학생 화면에 붙는다.
 * 화면(page)들이 각자 헤더를 복제하던 것을 여기로 되돌렸다.
 */
export default async function StudentDashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { initialMemberName } = await assertDashboardRole('ROLE_STUDENT');

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#fcfbfa]">
      <StudentAppBar initialMemberName={initialMemberName} />
      {children}
    </div>
  );
}

import { useTeacherOnboardingQuery } from '@/features/dashboard/hooks/use-onboarding-query';

import DashboardHeader from '../dashboard-header';
import Onboarding from './onboarding';

const DashboardTeacher = () => {
  const { data: teacherOnboarding } = useTeacherOnboardingQuery();

  return (
    <div className="flex w-full flex-col">
      <DashboardHeader isTeacher />
      <main className="tablet:gap-12 desktop:gap-20 bg-gray-white tablet:py-12 desktop:pb-100 tablet:px-20 relative flex w-full flex-col gap-8 px-4.5 py-8">
        {!teacherOnboarding?.isCompleted && <Onboarding />}
        <p className="text-body1-normal text-gray-8">준비중입니다...</p>
        {/* 모바일 레이아웃 */}

        {/* 태블릿 레이아웃 */}

        {/* 데스크탑 레이아웃 */}
        <div className="desktop:grid desktop:grid-cols-2 desktop:grid-rows-2 desktop:gap-x-15.5 desktop:gap-y-25 hidden"></div>
      </main>
    </div>
  );
};

export default DashboardTeacher;

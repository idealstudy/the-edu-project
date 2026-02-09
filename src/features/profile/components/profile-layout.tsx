import { FrontendBasicInfo } from '@/entities/teacher/types';
import ParentSections from '@/features/profile/components/parent-sections';
import StudentSections from '@/features/profile/components/student-sections';
import TeacherSections from '@/features/profile/components/teacher-sections';
import { ColumnLayout } from '@/layout';
import ProfileCard from '@/shared/components/profile/profile-card/profile-card';

export default function ProfileLayout({
  basicInfo,
}: {
  basicInfo: FrontendBasicInfo;
}) {
  let sections;

  switch (basicInfo.role) {
    case 'ROLE_TEACHER':
      sections = <TeacherSections />;
      break;
    case 'ROLE_STUDENT':
      sections = <StudentSections />;
      break;
    case 'ROLE_PARENT':
      sections = <ParentSections />;
      break;
    default:
      sections = <div>잘못된 접근입니다.</div>;
  }

  return (
    <>
      <ColumnLayout.Left>
        <div className="border-line-line1 flex flex-col gap-9 rounded-xl border bg-white p-8">
          <ProfileCard basicInfo={basicInfo} />
        </div>
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] desktop:px-8">
        <div className="flex flex-col gap-3">{sections}</div>
      </ColumnLayout.Right>
    </>
  );
}

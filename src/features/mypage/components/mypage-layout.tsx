import { ProfileWithMeta } from '@/entities/profile';
import EditableProfileCard from '@/features/mypage/components/editable-profile-card';
import ParentSections from '@/features/mypage/components/parent-sections';
import StudentSections from '@/features/mypage/components/student-sections';
import TeacherSections from '@/features/mypage/components/teacher-sections';
import { ColumnLayout } from '@/layout';

export default function MypageLayout({
  profile,
}: {
  profile: ProfileWithMeta;
}) {
  let sections;

  switch (profile.role) {
    case 'ROLE_TEACHER':
      sections = <TeacherSections profile={profile} />;
      break;
    case 'ROLE_STUDENT':
      sections = <StudentSections profile={profile} />;
      break;
    case 'ROLE_PARENT':
      sections = <ParentSections profile={profile} />;
      break;
    default:
      sections = <div>잘못된 접근입니다.</div>;
  }

  return (
    <>
      <ColumnLayout.Left>
        <div className="border-line-line1 flex flex-col gap-9 rounded-xl border bg-white p-8">
          <EditableProfileCard profile={profile} />
        </div>
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] desktop:px-8">
        <div className="flex flex-col gap-3">{sections}</div>
      </ColumnLayout.Right>
    </>
  );
}

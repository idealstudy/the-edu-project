import ParentSections from '@/features/profile/components/parent/parent-sections';
import ProfileCard from '@/features/profile/components/profile-card/profile-card';
import StudentSections from '@/features/profile/components/student/student-sections';
import TeacherSections from '@/features/profile/components/teacher/teacher-sections';
import { ProfileAccessProps } from '@/features/profile/types';
import { ColumnLayout } from '@/layout';

export default function ProfileLayout({
  profile,
  isOwner,
}: ProfileAccessProps) {
  let sections;

  switch (profile.role) {
    case 'ROLE_TEACHER':
      sections = (
        <TeacherSections
          profile={profile}
          isOwner={isOwner}
        />
      );
      break;
    case 'ROLE_STUDENT':
      sections = (
        <StudentSections
          profile={profile}
          isOwner={isOwner}
        />
      );
      break;
    case 'ROLE_PARENT':
      sections = (
        <ParentSections
          profile={profile}
          isOwner={isOwner}
        />
      );
      break;
    default:
      sections = <div>잘못된 접근입니다.</div>;
  }

  return (
    <>
      <ColumnLayout.Left>
        <div className="border-line-line1 flex flex-col gap-9 rounded-xl border bg-white p-8">
          <ProfileCard
            profile={profile}
            isOwner={isOwner}
          />
        </div>
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] desktop:px-8">
        <div className="flex flex-col gap-3">{sections}</div>
      </ColumnLayout.Right>
    </>
  );
}

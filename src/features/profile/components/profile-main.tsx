'use client';

import TeacherSections from '@/features/profile/components/teacher/teacher-sections';
import { useCurrentMember } from '@/providers/session/hooks/use-current-member';

type Props =
  | {
      userId: string;
      isOwner?: false;
    }
  | {
      userId?: never;
      isOwner: true;
    };

export default function ProfileMain({ userId, isOwner = false }: Props) {
  const { data: member /* , isPending, isError, refetch */ } =
    useCurrentMember(true);

  // console.log(member);

  if (!userId) userId = member!.id.toString();

  const profile = {
    id: userId,
    role: 'TEACHER',
    name: '테스트 강사',
    intro: '안녕하세요',
  };

  let sections;

  switch (profile.role) {
    case 'TEACHER':
      sections = (
        <TeacherSections
          profile={profile}
          isOwner={isOwner}
        />
      );
      break;
    case 'STUDENT':
    case 'PARENT':
    default:
      sections = <div>잘못된 접근입니다.</div>;
  }

  return <div className="flex flex-col gap-3">{sections}</div>;
}

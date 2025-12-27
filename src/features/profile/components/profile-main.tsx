'use client';

import { useRouter } from 'next/navigation';

import ProfileLayout from '@/features/profile/components/profile-layout';
import { ProfileViewerProps } from '@/features/profile/types';
import { useCurrentMember } from '@/providers/session/hooks/use-current-member';

export default function ProfileMain(props: ProfileViewerProps) {
  const router = useRouter();

  const { data: member } = useCurrentMember(true);

  if (props.mode === 'owner') {
    if (!member) {
      alert('로그인이 필요합니다.');
      router.replace('/login');
      return null;
    }

    return (
      <ProfileLayout
        profile={{
          id: member.id.toString(),
          role: member.role,
          name: member.name || '',
          email: member.email,
          intro: `안녕하세요, ${props.mode}`,
        }}
        isOwner
      />
    );
  }

  // props.mode === 'viewer'
  return (
    <ProfileLayout
      profile={{
        id: props.userId,
        role: 'ROLE_TEACHER',
        name: '이에듀',
        email: 'theedu@test.test',
        intro: `안녕하세요, ${props.mode}`,
      }}
      isOwner={false}
    />
  );
}

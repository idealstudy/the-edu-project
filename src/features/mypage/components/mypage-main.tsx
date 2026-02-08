'use client';

import { useRouter } from 'next/navigation';

import MypageLayout from '@/features/mypage/components/mypage-layout';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { useCurrentMember } from '@/providers/session/hooks/use-current-member';

export default function MypageMain() {
  const router = useRouter();

  const { data: member } = useCurrentMember(true);

  // TODO 새 API로 수정 예정 (memberId 제거)
  const memberId = member?.id.toString();
  const { data: profileData, isLoading } = useProfile(memberId);

  if (isLoading) {
    return <div className="text-center">로딩중...</div>;
  }

  if (!profileData) {
    return <div className="text-center">프로필 정보를 불러올 수 없습니다.</div>;
  }

  if (!member) {
    alert('로그인이 필요합니다.');
    router.replace('/login');
    return null;
  }

  // TODO ROLE_ADMIN, ROLE_MEMBER 처리 수정
  // ROLE_ADMIN: 마이페이지 제공하지 않음
  if (member.role === 'ROLE_ADMIN') {
    return <div>관리자 마이페이지는 준비 중입니다.</div>;
  }
  // ROLE_MEMBER: 역할 선택 페이지로 이동
  if (member.role === 'ROLE_MEMBER') {
    // 롤 선택 페이지로 이동
    router.replace('/select-role');
    return null;
  }

  return (
    <MypageLayout
      profile={{
        ...profileData,
        id: member.id.toString(),
        role: member.role,
      }}
    />
  );
}

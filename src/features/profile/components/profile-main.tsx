import ProfileLayout from '@/features/profile/components/profile-layout';

const MOCK_PROFILE_DATA = {
  name: 'string',
  email: 'string',
  isProfilePublic: true,
  simpleIntroduction: 'string',
  role: 'ROLE_TEACHER',
  profilePublicKorean: '공개',
};

export default function ProfileMain({}: { userId: string }) {
  // TODO 새 API 연결
  const profileData = MOCK_PROFILE_DATA;

  if (!profileData) {
    return <div className="text-center">프로필 정보를 불러올 수 없습니다.</div>;
  }

  return <ProfileLayout basicInfo={profileData} />;
}

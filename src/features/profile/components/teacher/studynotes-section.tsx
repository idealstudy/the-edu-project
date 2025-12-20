import { Profile } from '@/features/profile/components/teacher/teacher-sections';

type Props = {
  profile: Profile;
};

export default function StudynotesSection({ profile }: Props) {
  return <>스터디노트: {profile.name}</>;
}

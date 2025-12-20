import { Profile } from '@/features/profile/components/teacher/teacher-sections';

type Props = {
  profile: Profile;
};

export default function StudyroomSection({ profile }: Props) {
  return <>스터디룸: {profile.role}</>;
}

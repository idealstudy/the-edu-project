import { ContentsCard } from '@/features/dashboard/components';
import { Profile } from '@/features/profile/types';

type Props = {
  profile: Profile;
};

export default function StudyroomSection({}: Props) {
  return (
    <>
      <ContentsCard.Room
        key={1}
        room={{
          id: 1,
          title: 'title',
          subject: 'subject',
          schedule: '2025-12-27',
          nextLesson: '2025-12-27',
          memberCount: 4,
        }}
      />
    </>
  );
}

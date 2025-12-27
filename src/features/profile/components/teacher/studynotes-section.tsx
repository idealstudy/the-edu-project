import { Profile } from '@/features/profile/types';
import { StudyNotesList } from '@/features/study-notes/components/list';

type Props = {
  profile: Profile;
};

export default function StudynotesSection({}: Props) {
  return (
    <>
      <StudyNotesList
        data={[
          {
            id: 1,
            groupId: null,
            groupName: 'a',
            teacherName: '김에듀 강사',
            title: '수업노트 1',
            visibility: 'PUBLIC',
            taughtAt: '2025-12-27',
            updatedAt: '2025-12-29',
          },
        ]}
        studyRoomId={1}
        pageable={{
          page: 1,
          size: 1,
          sortKey: 'a',
        }}
        keyword={'search'}
        onRefresh={() => {}}
      />
    </>
  );
}

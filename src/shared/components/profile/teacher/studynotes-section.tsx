import { ProfileWithMeta } from '@/entities/profile';
import { StudyNote } from '@/features/study-notes/model';
import StudynotesItem from '@/shared/components/profile/teacher/studynotes-item';

const STUDY_NOTE: StudyNote = {
  id: 1,
  groupId: 1,
  groupName: 'group name',
  teacherName: '김에듀 강사',
  title: '수업노트 1',
  visibility: 'PUBLIC',
  taughtAt: '2025-12-27',
  updatedAt: '2025-12-29',
};

export default function StudynotesSection({}: { profile: ProfileWithMeta }) {
  return (
    <>
      <StudynotesItem
        variant="link"
        studynote={STUDY_NOTE}
      />
    </>
  );
}

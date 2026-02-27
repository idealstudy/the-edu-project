import { FrontendTeacherNoteList } from '@/entities/teacher';
import TeachingnotesItem from '@/features/profile/components/teacher/teachingnotes-item';

export default function StudynotesSection({
  teachingnotes,
}: {
  teachingnotes: FrontendTeacherNoteList;
}) {
  return (
    <>
      {teachingnotes.map((teachingnote) => (
        <TeachingnotesItem
          key={teachingnote.id}
          variant="link"
          teachingnote={teachingnote}
        />
      ))}
    </>
  );
}

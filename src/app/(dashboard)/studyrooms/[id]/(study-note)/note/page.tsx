import { StudyNotes } from '@/features/studyrooms/components/studynotes';

export default async function StudyNotePage() {
  const selectedGroupId = 'all';
  return (
    <>
      <StudyNotes selectedGroupId={selectedGroupId} />
    </>
  );
}

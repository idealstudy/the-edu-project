import StudyNoteDetailContentsSection from '@/features/dashboard/studynote/detail/components/contents-section';
import StudyNoteDetailMetaSection from '@/features/dashboard/studynote/detail/components/meta-section';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string; noteId: string }>;
};

export default async function StudyNoteDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <ColumnLayout className="items-start gap-6 p-6">
      <StudyNoteDetailMetaSection id={resolvedParams.noteId} />
      <StudyNoteDetailContentsSection id={resolvedParams.noteId} />
    </ColumnLayout>
  );
}

import { ColumnLayout } from '@/components/layout/column-layout';
import StudyNoteDetailContentsSection from '@/features/dashboard/studynote/detail/components/contents-section';
import StudyNoteDetailMetaSection from '@/features/dashboard/studynote/detail/components/meta-section';

export default async function StudyNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <ColumnLayout className="items-start gap-6 p-6">
      <StudyNoteDetailMetaSection id={resolvedParams.id} />
      <StudyNoteDetailContentsSection id={resolvedParams.id} />
    </ColumnLayout>
  );
}

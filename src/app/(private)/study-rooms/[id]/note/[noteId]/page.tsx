import BackLink from '@/features/dashboard/studynote/components/back-link';
import StudyNoteDetailContentsSection from '@/features/dashboard/studynote/detail/components/contents-section';
import StudyNoteDetailMetaSection from '@/features/dashboard/studynote/detail/components/meta-section';
import { ColumnLayout } from '@/layout/column-layout';

import PageViewTracker from './page-view-tracker';

type Props = {
  params: Promise<{ id: string; noteId: string }>;
};

export default async function StudyNoteDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <>
      <PageViewTracker pageName="studynote_detail" />
      <div className="mb-6">
        <BackLink />
      </div>
      <ColumnLayout className="items-start gap-6 p-6">
        <StudyNoteDetailMetaSection id={resolvedParams.noteId} />
        <StudyNoteDetailContentsSection id={resolvedParams.noteId} />
      </ColumnLayout>
    </>
  );
}

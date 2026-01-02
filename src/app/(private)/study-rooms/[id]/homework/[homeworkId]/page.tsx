import BackLink from '@/features/dashboard/studynote/components/back-link';
// import StudyNoteDetailContentsSection from '@/features/dashboard/studynoteHomework/detail/components/contents-section';
// import StudyNoteDetailMetaSection from '@/features/dashboard/studynoteHomework/detail/components/meta-section';
import { ColumnLayout } from '@/layout/column-layout';

// type Props = {
//   params: Promise<{ id: string; homeworkId: string }>;
// };

export default async function HomeworkDetailPage() {
  // const resolvedParams = await params;

  return (
    <>
      <div className="mb-6">
        <BackLink />
      </div>
      <ColumnLayout className="items-start gap-6 p-6">
        {/* <StudyNoteDetailMetaSection id={resolvedParams.homeworkId} />
        <StudyNoteDetailContentsSection id={resolvedParams.homeworkId} /> */}
      </ColumnLayout>
    </>
  );
}

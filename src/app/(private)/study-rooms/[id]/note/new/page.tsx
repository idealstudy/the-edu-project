import BackLink from '@/features/dashboard/studynote/components/back-link';
import { StudyNoteFormProvider } from '@/features/dashboard/studynote/write/components/form-provider';
import SelectArea from '@/features/dashboard/studynote/write/components/select-area';
import WriteArea from '@/features/dashboard/studynote/write/components/write-area';
import { StudyNoteWriteForm } from '@/features/dashboard/studynote/write/components/write-form';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudyNoteWritePage({ params }: Props) {
  const resolvedParams = await params;
  const studyRoomId = Number(resolvedParams.id);

  return (
    <>
      <div className="mb-6">
        <BackLink />
      </div>

      <StudyNoteFormProvider defaultStudyRoomId={studyRoomId}>
        <StudyNoteWriteForm>
          <ColumnLayout className="pb-10">
            <SelectArea />
            <WriteArea />
          </ColumnLayout>
        </StudyNoteWriteForm>
      </StudyNoteFormProvider>
    </>
  );
}

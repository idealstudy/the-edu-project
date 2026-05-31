import BackLink from '@/features/dashboard/studynote/components/back-link';
import { StudyNoteFormProvider } from '@/features/dashboard/studynote/write/components/form-provider';
import StudyNoteEditForm from '@/features/dashboard/studynote/write/components/note-edit-form';
import SelectArea from '@/features/dashboard/studynote/write/components/select-area';
import WriteArea from '@/features/dashboard/studynote/write/components/write-area';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string; noteId: string }>;
};

export default async function StudyNoteEditPage({ params }: Props) {
  const resolvedParams = await params;
  const studyRoomId = Number(resolvedParams.id);
  const noteId = Number(resolvedParams.noteId);

  return (
    <>
      <BackLink />

      <StudyNoteFormProvider
        defaultStudyRoomId={studyRoomId}
        noteId={noteId}
        isEditMode={true}
      >
        <StudyNoteEditForm
          noteId={noteId}
          studyRoomId={studyRoomId}
        >
          <ColumnLayout className="pb-10">
            <SelectArea />
            <WriteArea isEditMode={true} />
          </ColumnLayout>
        </StudyNoteEditForm>
      </StudyNoteFormProvider>
    </>
  );
}

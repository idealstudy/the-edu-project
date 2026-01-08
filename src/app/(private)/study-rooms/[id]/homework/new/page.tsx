import BackLink from '@/features/dashboard/studynote/components/back-link';
import SelectArea from '@/features/dashboard/studynote/write/components/select-area';
import { HomeworkFormProvider } from '@/features/homework/components/write/components/form-provider';
import { WriteArea } from '@/features/homework/components/write/components/write-area';
import { HomeworkWriteForm } from '@/features/homework/components/write/components/write-form';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudyNoteHomeworkWritePage({ params }: Props) {
  const resolvedParams = await params;
  const studyRoomId = Number(resolvedParams.id);

  return (
    <>
      <div className="mr-5">
        <BackLink />
      </div>

      <HomeworkFormProvider studyRoomId={studyRoomId}>
        <HomeworkWriteForm>
          <ColumnLayout className="pb-10">
            <SelectArea />
            <WriteArea />
          </ColumnLayout>
        </HomeworkWriteForm>
      </HomeworkFormProvider>
    </>
  );
}

import BackLink from '@/features/dashboard/studynoteHomework/components/back-link';
import { HomeworkFormProvider } from '@/features/dashboard/studynoteHomework/write/components/form-provider';
import SelectArea from '@/features/dashboard/studynoteHomework/write/components/select-area';
import WriteArea from '@/features/dashboard/studynoteHomework/write/components/write-area';
import { HomeworkWriteForm } from '@/features/dashboard/studynoteHomework/write/components/write-form';
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

      <HomeworkFormProvider defaultStudyRoomId={studyRoomId}>
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

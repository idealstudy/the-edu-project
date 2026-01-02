import BackLink from '@/features/dashboard/studynoteHomework/components/back-link';
import { HomeworkFormProvider } from '@/features/dashboard/studynoteHomework/write/components/form-provider';
import HomeworkEditForm from '@/features/dashboard/studynoteHomework/write/components/homework-edit-form';
import SelectArea from '@/features/dashboard/studynoteHomework/write/components/select-area';
import WriteArea from '@/features/dashboard/studynoteHomework/write/components/write-area';
import { ColumnLayout } from '@/layout/column-layout';

type Props = {
  params: Promise<{ id: string; homeworkId: string }>;
};

export default async function HomeworkEditPage({ params }: Props) {
  const resolvedParams = await params;
  const studyRoomId = Number(resolvedParams.id);
  const homeworkId = Number(resolvedParams.homeworkId);

  return (
    <>
      <div className="mb-6">
        <BackLink />
      </div>

      <HomeworkFormProvider
        defaultStudyRoomId={studyRoomId}
        homeworkId={homeworkId}
        isEditMode={true}
      >
        <HomeworkEditForm
          homeworkId={homeworkId}
          studyRoomId={studyRoomId}
        >
          <ColumnLayout className="pb-10">
            <SelectArea />
            <WriteArea isEditMode={true} />
          </ColumnLayout>
        </HomeworkEditForm>
      </HomeworkFormProvider>
    </>
  );
}

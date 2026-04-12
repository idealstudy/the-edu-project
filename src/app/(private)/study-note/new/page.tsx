'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import BackLink from '@/features/dashboard/studynote/components/back-link';
import {
  StudentStudyNoteFields,
  StudentStudyNoteSubmitButton,
} from '@/features/student-study-note/components/student-study-note-form';
import {
  StudentStudyNoteForm,
  studentStudyNoteSchema,
} from '@/features/student-study-note/schemas/study-note';
import { ColumnLayout } from '@/layout/column-layout';
import { Form } from '@/shared/components/ui/form';
import { PRIVATE } from '@/shared/constants';
import { zodResolver } from '@hookform/resolvers/zod';

export default function StudentStudyNoteNewPage() {
  const router = useRouter();

  const methods = useForm<StudentStudyNoteForm>({
    resolver: zodResolver(studentStudyNoteSchema),
    defaultValues: {
      title: '',
      studiedAt: new Date().toISOString().split('T')[0],
      subject: '',
      content: {},
    },
    mode: 'onChange',
  });

  const onSubmit = () => {
    // TODO: API 연동
    router.replace(PRIVATE.DASHBOARD.INDEX);
  };

  return (
    <ColumnLayout className="tablet:flex-col desktop:flex-col flex flex-col gap-0 pb-10">
      <BackLink className="mb-6" />
      <div className="border-line-line1 w-full rounded-xl border bg-white px-8 py-10">
        <div className="mb-8">
          <div className="text-key-color-primary font-semibold">
            학습노트 작성
          </div>
          <h1 className="mt-2 text-[32px] font-bold">
            어떤 학습을
            <br />
            진행하셨나요?
          </h1>
        </div>
        <FormProvider {...methods}>
          <Form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="space-y-8">
              <StudentStudyNoteFields />
              <StudentStudyNoteSubmitButton />
            </div>
          </Form>
        </FormProvider>
      </div>
    </ColumnLayout>
  );
}

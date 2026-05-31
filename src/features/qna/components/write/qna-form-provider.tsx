'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { QnACreateForm, QnaACreateFormSchema } from '../../schema/create';

const QnAFormProvider = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<QnACreateForm>({
    resolver: zodResolver(QnaACreateFormSchema),
    defaultValues: {
      title: '',
      studyRoomId: undefined,
      relatedTeachingNoteId: null,
      visibility: undefined, // 또는 'PUBLIC'
    },
    mode: 'onChange',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export default QnAFormProvider;

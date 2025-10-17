'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { QnACreateForm, QnaACreateFormSchema } from '../../schema/create';

export const RequiredMark = () => {
  return <span className="text-key-color-primary"> *</span>;
};

const QnAFormProvider = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<QnACreateForm>({
    resolver: zodResolver(QnaACreateFormSchema),
    defaultValues: {
      title: '',
      content: {},
      studyRoomId: undefined,
    },
    mode: 'onChange',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export default QnAFormProvider;

'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { QnAMessageForm, QnAMessageFormSchema } from '../../schema/create';

export const RequiredMark = () => {
  return <span className="text-key-color-primary"> *</span>;
};

const QnAMessageFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const methods = useForm<QnAMessageForm>({
    resolver: zodResolver(QnAMessageFormSchema),
    defaultValues: {
      content: {},
    },
    mode: 'onChange',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export default QnAMessageFormProvider;

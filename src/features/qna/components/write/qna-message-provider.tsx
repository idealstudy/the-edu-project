'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { QnAMessageForm, QnAMessageFormSchema } from '../../schema/create';

const QnAMessageFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const methods = useForm<QnAMessageForm>({
    resolver: zodResolver(QnAMessageFormSchema),
    mode: 'onChange',
    defaultValues: {
      content: {
        type: 'doc',
        content: [],
      },
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export default QnAMessageFormProvider;

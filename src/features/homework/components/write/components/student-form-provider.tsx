'use client';

import { PropsWithChildren } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import type { JSONContent } from '@tiptap/react';

import {
  StudentHomeworkForm,
  StudentHomeworkFormSchema,
} from '../schemas/create';

const EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

type Props = PropsWithChildren<{
  studyRoomId: number;
  homeworkId: number;
}>;

export const StudentHomeworkFormProvider = ({
  studyRoomId,
  homeworkId,
  children,
}: Props) => {
  const methods = useForm<StudentHomeworkForm>({
    resolver: zodResolver(StudentHomeworkFormSchema),
    mode: 'onChange',
    defaultValues: {
      studyRoomId,
      homeworkId,
      content: EMPTY_DOC,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

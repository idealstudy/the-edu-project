'use client';

import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { usePostStudentHomework } from '@/features/homework/hooks/student/useStudentHomeworkMutations';
import { ColumnLayout } from '@/layout/column-layout';
import { TextEditor } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';

import { StudentHomeworkForm } from '../schemas/create';

type Props = {
  studyRoomId: number;
  homeworkId: number;
};

// 학생이 과제 제출
export const WriteFormArea = ({ studyRoomId, homeworkId }: Props) => {
  const { mutate, isPending } = usePostStudentHomework();
  const {
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext<StudentHomeworkForm>();

  useEffect(() => {
    if (studyRoomId != null) {
      setValue('studyRoomId', studyRoomId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    if (homeworkId != null) {
      setValue('homeworkId', homeworkId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [studyRoomId, homeworkId, setValue]);

  const isButtonDisabled = !isValid || isPending || isSubmitting;

  const onSubmit = (data: StudentHomeworkForm) => {
    mutate(
      {
        studyRoomId,
        homeworkId,
        content: JSON.stringify(data.content),
      },
      {
        onSuccess: () => {
          reset({ content: {} });
        },
      }
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ColumnLayout.Right className="desktop:min-w-[740px] h-fit w-full">
        <div className="space-y-5">
          {/* 내용 */}
          <Form.Item error={!!errors.content}>
            <Form.Control>
              <Controller
                name="content"
                control={control}
                render={({ field }) => {
                  return (
                    <TextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="제출할 과제를 작성해 주세요..."
                    />
                  );
                }}
              />
            </Form.Control>
            {errors.content && (
              <Form.ErrorMessage className="text-system-warning text-sm">
                {typeof errors.content?.message === 'string'
                  ? errors.content.message
                  : null}
              </Form.ErrorMessage>
            )}
          </Form.Item>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="w-[200px] rounded-sm"
            >
              작성하기
            </Button>
          </div>
        </div>
      </ColumnLayout.Right>
    </Form>
  );
};

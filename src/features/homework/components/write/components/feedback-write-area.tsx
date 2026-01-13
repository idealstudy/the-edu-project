'use client';

import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { usePostTeacherHomeworkFeedback } from '@/features/homework/hooks/teacher/useTeacherHomeworkFeedbackMutations';
import { ColumnLayout } from '@/layout/column-layout';
import { TextEditor } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';

import { HomeworkFeedbackForm } from '../schemas/create';

type Props = {
  studyRoomId: number;
  homeworkStudentId: number;
  homeworkId: number;
  setIsClicked: (set: boolean) => void;
};

// 선생님이 피드백 제출
export const FeedbackWriteArea = ({
  studyRoomId,
  homeworkStudentId,
  homeworkId,
  setIsClicked,
}: Props) => {
  const { mutate, isPending } = usePostTeacherHomeworkFeedback();
  const {
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext<HomeworkFeedbackForm>();

  useEffect(() => {
    if (studyRoomId != null) {
      setValue('studyRoomId', studyRoomId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    if (homeworkStudentId != null) {
      setValue('homeworkStudentId', homeworkStudentId, {
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
  }, [studyRoomId, homeworkStudentId, homeworkId, setValue]);

  const isButtonDisabled = !isValid || isPending || isSubmitting;

  const onSubmit = (data: HomeworkFeedbackForm) => {
    mutate(
      {
        studyRoomId,
        homeworkId,
        homeworkStudentId,
        content: JSON.stringify(data.content),
      },
      {
        onSuccess: () => {
          reset({ content: {} });
          setIsClicked(false);
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
                      placeholder="피드백을 작성해 주세요..."
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

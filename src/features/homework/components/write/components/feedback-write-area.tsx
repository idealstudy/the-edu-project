'use client';

import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useUpdateTeacherOnboarding } from '@/features/dashboard/hooks/use-update-onboarding';
import { usePostTeacherHomeworkFeedback } from '@/features/homework/hooks/teacher/useTeacherHomeworkFeedbackMutations';
import { ColumnLayout } from '@/layout/column-layout';
import { TextEditor, prepareContentForSave } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { getApiError } from '@/shared/lib';

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
  const { sendOnboarding } = useUpdateTeacherOnboarding('GIVE_FEEDBACK');

  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError('피드백 저장 중 오류가 발생했습니다.');

    // 실패 후 submitError가 남을 수 있기 때문.
    setSubmitError(null);

    const { contentString, mediaIds } = prepareContentForSave(data.content);

    mutate(
      {
        studyRoomId,
        homeworkId,
        homeworkStudentId,
        content: contentString,
        mediaIds,
      },
      {
        onSuccess: () => {
          reset({ content: {} });
          setSubmitError(null);
          setIsClicked(false);
          // 온보딩 반영
          sendOnboarding();
        },
        onError: (error) => {
          const apiError = getApiError(error);
          if (!apiError) {
            setSubmitError('피드백 저장 중 오류가 발생했습니다.');
            return;
          }
          switch (apiError.code) {
            case 'MEMBER_NOT_EXIST':
            case 'STUDY_ROOM_NOT_EXIST':
            case 'HOMEWORK_STUDENT_NOT_EXIST':
              setSubmitError(apiError.message);
              break;

            default:
              setSubmitError('피드백 작성에 실패했습니다.');
          }
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
                      targetType="HOMEWORK"
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
          <div className="space-y-2">
            {submitError && (
              <p className="text-system-warning text-right text-sm">
                {submitError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => setIsClicked(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isButtonDisabled}
                className="w-[200px] rounded-sm"
              >
                작성하기
              </Button>
            </div>
          </div>
        </div>
      </ColumnLayout.Right>
    </Form>
  );
};

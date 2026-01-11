'use client';

import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ColumnLayout } from '@/layout/column-layout';
import { TextEditor, prepareContentForSave } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { useRole } from '@/shared/hooks/use-role';
import { trackReplyCreateClick } from '@/shared/lib/gtm/trackers';
import { useMemberStore } from '@/store';
import { JSONContent } from '@tiptap/react';

import { QnAMessageForm } from '../../schema/create';
import { useWriteQnAMessageMutation } from '../../services/query';

type Props = {
  studyRoomId: number;
  contextId: number;
};

const WriteArea = ({ studyRoomId, contextId }: Props) => {
  const { role } = useRole();
  const session = useMemberStore((s) => s.member);

  const { mutate, isPending } = useWriteQnAMessageMutation(role);
  const {
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext<QnAMessageForm>();

  useEffect(() => {
    if (studyRoomId != null) {
      setValue('studyRoomId', studyRoomId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }

    if (contextId != null) {
      setValue('contextId', contextId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [studyRoomId, contextId, setValue]);

  const isButtonDisabled = !isValid || isPending || isSubmitting;

  const onSubmit = (data: {
    studyRoomId: number;
    contextId: number;
    content: JSONContent;
  }) => {
    // 답글 작성 클릭 이벤트
    trackReplyCreateClick(
      {
        room_id: studyRoomId,
        question_id: contextId,
        user_id: session?.id ?? 0,
      },
      session?.role ?? null
    );

    const { contentString, mediaIds } = prepareContentForSave(data.content);

    mutate(
      {
        studyRoomId,
        contextId,
        content: contentString,
        mediaIds,
      },
      {
        onSuccess: () => {
          // 폼 리셋
          reset({ content: {} });
          // 쿼리 무효화는 mutation hook에서 처리되므로 라우팅 불필요
          // 같은 페이지에 있으므로 자동으로 업데이트됨
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
                      placeholder="질문에 대한 답을 적어주세요..."
                      targetType="QNA"
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
export default WriteArea;

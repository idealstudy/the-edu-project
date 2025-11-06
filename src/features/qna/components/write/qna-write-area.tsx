'use client';

import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { TextEditor } from '@/components/editor';
import { ColumnLayout } from '@/components/layout/column-layout';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ROUTE } from '@/constants/route';
import { JSONContent } from '@tiptap/react';

import { QnACreateForm } from '../../schema/create';
import { useWriteQnAMutation } from '../../services/query';
import { RequiredMark } from './qna-form-provider';

type Props = {
  studyRoomId: number;
};

const WriteArea = ({ studyRoomId }: Props) => {
  const router = useRouter();

  const { mutate, isPending } = useWriteQnAMutation();
  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useFormContext<QnACreateForm>();

  useEffect(() => {
    if (studyRoomId != null) {
      setValue('studyRoomId', studyRoomId, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [studyRoomId, setValue]);

  const isButtonDisabled = !isValid || isPending || isSubmitting;

  const onSubmit = (data: {
    studyRoomId: number;
    title: string;
    content: JSONContent;
  }) => {
    mutate(
      {
        studyRoomId,
        title: data.title,
        content: JSON.stringify(data.content),
      },
      {
        onSuccess: () => {
          router.replace(ROUTE.DASHBOARD.HOME);
        },
      }
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ColumnLayout.Right className="desktop:min-w-[740px] border-line-line1 h-fit w-full rounded-xl border bg-white px-8 py-10">
        <div className="flex w-full justify-between">
          <span>
            <div className="text-key-color-primary font-semibold">
              질문 작성
            </div>
            <h1 className="mt-2 text-[32px] font-bold">
              어떤 궁금증이 <br /> 생겼나요?
            </h1>
          </span>
          <Image
            src="/studyroom/study-room-write-header.png"
            alt="header-image"
            width={71}
            height={151}
          />
        </div>
        <div className="space-y-8">
          <Form.Item error={!!errors.title}>
            <Form.Label>
              제목
              <RequiredMark />
            </Form.Label>
            <Form.Control>
              <Input
                {...register('title')}
                type="text"
                placeholder="질문의 제목을 입력해주세요."
                disabled={isPending}
              />
            </Form.Control>
            <Form.ErrorMessage className="text-system-warning text-sm">
              {errors.title?.message}
            </Form.ErrorMessage>
          </Form.Item>

          {/* 내용 */}
          <Form.Item error={!!errors.content}>
            <Form.Label>
              내용
              <RequiredMark />
            </Form.Label>
            <Form.Control>
              <Controller
                name="content"
                control={control}
                render={({ field }) => {
                  return (
                    <TextEditor
                      value={field}
                      onChange={field.onChange}
                      placeholder="질문 내용을 입력해주세요..."
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

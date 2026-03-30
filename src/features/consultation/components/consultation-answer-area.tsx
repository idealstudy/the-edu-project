'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Image from 'next/image';

import { ConsultationDetail } from '@/entities/consultation';
import { useCreateConsultationAnswer } from '@/features/consultation/hooks/use-answer-form';
import { useTeacherProfile } from '@/features/consultation/hooks/use-teacher-profile';
import {
  ConsultationAnswerForm,
  ConsultationAnswerFormSchema,
} from '@/features/consultation/schema/schema';
import { Button, DropdownMenu, Form, Textarea } from '@/shared/components/ui';
import { getRelativeTimeString } from '@/shared/lib';
import { useMemberStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ConsultationAnswerArea({
  consultation,
}: {
  consultation: ConsultationDetail;
}) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  const memberId = useMemberStore((s) => s.member?.id);
  const isTargetTeacher = memberId === consultation.targetTeacherId;

  // 문의 대상 선생님 정보 조회
  const { data: teacherProfile } = useTeacherProfile(
    consultation.targetTeacherId
  );

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<ConsultationAnswerForm>({
    resolver: zodResolver(ConsultationAnswerFormSchema),
    defaultValues: { content: '' },
    mode: 'onChange',
  });

  const { mutate, isPending } = useCreateConsultationAnswer(consultation.id);

  const onSubmit = (data: { content: string }) => {
    mutate(data.content);
  };

  if (consultation.answer) {
    return (
      /* 답변 표시 - 선생님이면 수정/삭제 가능 */
      <div className="border-line-line1 mt-4 h-fit w-full rounded-xl border bg-white px-8 py-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row items-center justify-between">
            {/* 프로필 */}
            <div className="flex flex-row items-center gap-3">
              <div className="bg-gray-scale-gray-10 h-10 w-10 rounded-full" />
              <span className="font-body2-heading">
                {teacherProfile?.name} 선생님
              </span>
            </div>

            {isTargetTeacher && (
              <DropdownMenu
                open={isDropdownMenuOpen}
                onOpenChange={setIsDropdownMenuOpen}
              >
                <DropdownMenu.Trigger className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-gray-100">
                  <Image
                    src="/studynotes/gray-kebab.svg"
                    width={24}
                    height={24}
                    alt="더보기"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="flex min-w-[110px] flex-col items-center">
                  <DropdownMenu.Item>수정</DropdownMenu.Item>
                  <DropdownMenu.Item variant="danger">삭제</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>

          {/* 답변 내용 */}
          <p className="font-body2-normal whitespace-pre-wrap">
            {consultation.answer.content}
          </p>

          {/* 작성일 */}
          <span className="font-caption-normal text-text-sub2 self-end">
            {getRelativeTimeString(consultation.answer.regDate) + ' 작성'}
          </span>
        </div>
      </div>
    );
  }

  if (!consultation.answer && isTargetTeacher) {
    return (
      /* 답변 작성 폼 */
      <div className="border-line-line1 mt-4 h-fit w-full rounded-xl border bg-white px-8 py-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row items-center gap-3">
            {/* 프로필 */}
            <div className="bg-gray-scale-gray-10 h-10 w-10 rounded-full" />
            <span className="font-body2-heading">
              {teacherProfile?.name} 선생님
            </span>
          </div>

          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <Textarea
              {...register('content')}
              placeholder="답변을 입력해주세요."
              className="h-40 resize-none"
              disabled={isPending}
            />
            <Button
              type="submit"
              disabled={isPending || !isValid}
              className="w-full"
            >
              {isPending ? '저장 중' : '답변 등록'}
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  return null;
}

'use client';

import { useForm } from 'react-hook-form';

import { ConsultationDetail } from '@/entities/consultation';
import { useCreateConsultationAnswer } from '@/features/consultation/hooks/use-answer-form';
import { useTeacherProfile } from '@/features/consultation/hooks/use-teacher-profile';
import {
  ConsultationAnswerForm,
  ConsultationAnswerFormSchema,
} from '@/features/consultation/schema/schema';
import { Button, Form, Textarea } from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ConsultationAnswerWrite({
  consultation,
}: {
  consultation: ConsultationDetail;
}) {
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

  const onSubmit = (data: ConsultationAnswerForm) => {
    mutate(data.content);
  };

  return (
    <div className="border-line-line1 mt-4 h-fit w-full rounded-xl border bg-white px-8 py-10">
      <div className="flex flex-col gap-5">
        {/* 프로필 */}
        <div className="flex flex-row items-center gap-3">
          <div className="bg-gray-scale-gray-10 h-10 w-10 rounded-full" />
          <span className="font-body2-heading">
            {teacherProfile?.name ? `${teacherProfile.name} 선생님` : null}
          </span>
        </div>

        {/* 답변 작성 폼 */}
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

'use client';

import { ConsultationDetail } from '@/entities/consultation';
import ConsultationAnswerView from '@/features/consultation/components/consultation-answer-view';
import ConsultationAnswerWrite from '@/features/consultation/components/consultation-answer-write';
import { useMemberStore } from '@/store';

export default function ConsultationAnswerArea({
  consultation,
}: {
  consultation: ConsultationDetail;
}) {
  const memberId = useMemberStore((state) => state.member?.id);
  const isTargetTeacher = memberId === consultation.targetTeacherId;

  /* 답변 표시 - 선생님이면 수정/삭제 가능 */
  if (consultation.answer) {
    return (
      <ConsultationAnswerView
        consultation={consultation}
        isTargetTeacher={isTargetTeacher}
      />
    );
  }

  /* 답변 작성 폼 */
  if (isTargetTeacher) {
    return <ConsultationAnswerWrite consultation={consultation} />;
  }

  return null;
}

'use client';

import { useState } from 'react';

import { InquiryDetail } from '@/entities/inquiry';
import InquiryAnswerView from '@/features/inquiry/components/inquiry-answer-view';
import InquiryAnswerWrite from '@/features/inquiry/components/inquiry-answer-write';
import { useMemberStore } from '@/store';

export default function InquiryAnswerArea({
  inquiry,
}: {
  inquiry: InquiryDetail;
}) {
  const memberId = useMemberStore((state) => state.member?.id);
  const isTargetTeacher = memberId === inquiry.targetTeacherId;
  const [isEditing, setIsEditing] = useState(false);

  /* 답변 표시 - 선생님이면 수정/삭제 가능 */
  if (inquiry.answer && !isEditing) {
    return (
      <InquiryAnswerView
        inquiry={inquiry}
        isTargetTeacher={isTargetTeacher}
        onEdit={() => setIsEditing(true)}
      />
    );
  }

  /* 답변 - 수정 모드 */
  if (inquiry.answer && isEditing) {
    return (
      <InquiryAnswerWrite
        inquiry={inquiry}
        isEditMode
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  /* 답변 작성 폼 */
  if (isTargetTeacher) {
    return <InquiryAnswerWrite inquiry={inquiry} />;
  }

  return null;
}

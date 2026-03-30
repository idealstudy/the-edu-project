'use client';

import ConsultationAnswerArea from '@/features/consultation/components/consultation-answer-area';
import { useConsultation } from '@/features/consultation/hooks/use-consultation';
import { MiniSpinner } from '@/shared/components/loading';
import { getRelativeTimeString } from '@/shared/lib';

export default function ConsultationDetailArea({ id }: { id: number }) {
  const { data: consultation, isLoading } = useConsultation(id);

  if (isLoading) return <MiniSpinner />;
  if (!consultation) return <p>문의 내용이 없습니다.</p>;

  return (
    <>
      <div className="border-line-line1 mt-4 h-fit w-full rounded-xl border bg-white px-8 py-10">
        {/* 문의 내용 */}
        <div className="flex flex-col gap-5">
          {/* 프로필 */}
          <div className="flex flex-row items-center gap-3">
            <div className="bg-gray-scale-gray-10 h-10 w-10 rounded-full" />
            <span className="font-body2-heading">
              {consultation.inquirerName}
            </span>
          </div>

          {/* 제목 */}
          <h2 className="font-title-heading">{consultation.title}</h2>

          {/* 문의 내용 */}
          <p className="font-body2-normal whitespace-pre-wrap">
            {consultation.content}
          </p>

          {/* 작성 날짜 */}
          <span className="font-caption-normal text-text-sub2 self-end">
            {getRelativeTimeString(consultation.regDate) + ' 작성'}
          </span>
        </div>
      </div>

      {/* 답변 영역 */}
      <ConsultationAnswerArea consultation={consultation} />
    </>
  );
}

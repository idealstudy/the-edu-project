'use client';

import { cn } from '@/shared/lib';

/**
 * 교사 응시장 카드 — MVP-G v3 교사·학부모 플로우의 "배정 → 결과 → 다음 할 일 꽂기" 요약.
 * ⛔ 백엔드 계약 필요: PDF 문항분할·학생 배정·응시 결과 집계 API 부재
 * (기존 TeacherDashboardController에는 report/study-rooms/teaching-notes/members/homeworks/qna만 존재).
 * 지금은 실제 배정·전송 액션 없이 요약 카드만 노출한다(가짜 액션 버튼 금지).
 */
export const ExamHallTeacherCard = ({ className }: { className?: string }) => {
  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
    >
      <h3 className="font-body1-heading text-gray-12">
        응시장
        <span className="font-body2-normal text-gray-8 ml-1.5">
          시험지 배정 · 결과 확인
        </span>
      </h3>
      <p className="font-body2-normal text-gray-8 mt-2 leading-relaxed">
        PDF를 올려 문항을 나누고 학생에게 배정하면, 응시 결과가 여기 돌아와요.
        오답 유형을 그대로 학생의 &apos;오늘 할 일&apos;로 꽂을 수 있어요.
      </p>
      <div className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-6 text-center">
        <p className="font-body2-heading text-gray-10">준비 중이에요</p>
        <p className="font-caption-normal text-gray-8">
          시험지 배정·결과판 기능은 곧 열려요
        </p>
      </div>
    </section>
  );
};

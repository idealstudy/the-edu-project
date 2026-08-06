'use client';

import Link from 'next/link';

import { useExamHallQuery } from '@/features/exam/hooks/use-exam-query';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';

export const ExamHall = () => {
  const hall = useExamHallQuery();

  if (hall.isPending) {
    return (
      <p className="py-20 text-center text-sm text-[#71717a]">
        응시장을 불러오는 중입니다
      </p>
    );
  }
  if (hall.isError) {
    return (
      <div
        className="rounded-xl border border-[#efb5ae] bg-[#fff5f3] p-6"
        role="alert"
      >
        <h2 className="text-sm font-extrabold text-[#9f2f26]">
          응시장을 불러오지 못했어요
        </h2>
        <Button
          size="small"
          variant="outlined"
          className="mt-3"
          onClick={() => void hall.refetch()}
        >
          다시 불러오기
        </Button>
      </div>
    );
  }

  const assigned = hall.data?.assigned ?? [];
  const publicExams = hall.data?.public ?? [];

  return (
    <div
      className="mx-auto max-w-[980px]"
      data-testid="student-exam-hall"
    >
      <h1 className="mb-4 text-[19px] font-extrabold text-[#27272a]">응시장</h1>
      {assigned.length > 0 && (
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-5">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-sm font-extrabold">우리 반 시험</h2>
            <span className="text-xs text-[#71717a]">선생님이 배정</span>
          </div>
          {assigned.map((exam) => (
            <div
              key={exam.attemptId}
              className="flex flex-wrap items-center gap-3 border-b border-[#ececef] py-3 last:border-b-0"
            >
              <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#27272a]">
                {exam.title}
                <small className="mt-1 block text-[11px] font-normal text-[#71717a]">
                  {exam.periodEnd
                    ? `${new Date(exam.periodEnd).toLocaleString('ko-KR')}까지`
                    : '마감 시각 없음'}{' '}
                  · {exam.questionCount}문항
                </small>
              </span>
              <span className="rounded-full bg-[#fff0e2] px-2.5 py-1 text-[11px] font-bold text-[#9a460d]">
                우리 반
              </span>
              <Button
                asChild
                size="xsmall"
                variant={exam.status === 'ANALYZED' ? 'outlined' : 'primary'}
              >
                <Link href={PRIVATE.DASHBOARD.EXAM_ATTEMPT(exam.attemptId)}>
                  {exam.status === 'ANALYZED' ? '분석 보기' : '응시하기'}
                </Link>
              </Button>
            </div>
          ))}
        </section>
      )}

      <section className="mt-4 rounded-xl border border-[#e4e4e7] bg-white p-5">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-extrabold">공개 시험</h2>
          <span className="text-xs text-[#71717a]">
            관리자 게시 · 누구나 응시
          </span>
        </div>
        {publicExams.map((exam) => (
          <div
            key={exam.examId}
            className="flex flex-wrap items-center gap-3 border-b border-[#ececef] py-3 last:border-b-0"
          >
            <span className="min-w-0 flex-1 text-[13px] font-semibold">
              {exam.title}
              <small className="mt-1 block text-[11px] font-normal text-[#71717a]">
                {exam.questionCount}문항 ·{' '}
                {exam.hasCutoff ? '전국 통계 있음' : 'AI 예측'}
              </small>
            </span>
            <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-bold text-[#245f9e]">
              공개
            </span>
            <Button
              size="xsmall"
              variant="outlined"
            >
              응시하기
            </Button>
          </div>
        ))}
        {publicExams.length === 0 && (
          <p className="py-8 text-center text-xs text-[#71717a]">
            지금 공개된 시험이 없습니다.
          </p>
        )}
        <p className="mt-3 text-[11px] leading-5 text-[#71717a]">
          응시하기를 누르면 <b>우리 시험 응시 화면</b>이 열립니다. 시험지를 시간
          재고 통째로 푸는 일은 여기서 맡고, 한 문제씩 코치와 대화하며 푸는 일만
          오픈챌린지가 맡습니다.
        </p>
      </section>

      {assigned.length === 0 && (
        <section className="mt-4 rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-6 py-10 text-center">
          <h2 className="text-sm font-extrabold text-[#27272a]">
            우리 반 시험은 아직 없어요
          </h2>
          <p className="mt-2 text-xs leading-6 text-[#71717a]">
            선생님이 연결되면 선생님이 낸 시험이 위 칸에 먼저 뜹니다. 지금은
            공개 시험으로 시작하면 됩니다.
          </p>
          <Button
            size="small"
            className="mt-4"
          >
            선생님 초대 링크 만들기
          </Button>
        </section>
      )}
    </div>
  );
};

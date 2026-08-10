'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useStartPublicExamAttempt } from '@/features/exam/hooks/use-exam-mutation';
import { useExamHallQuery } from '@/features/exam/hooks/use-exam-query';
import { Button, Card, EmptyState } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants';

export const ExamHall = () => {
  const hall = useExamHallQuery();
  const router = useRouter();
  const startAttempt = useStartPublicExamAttempt();
  const [failedExamId, setFailedExamId] = useState<number | null>(null);

  const openPublicExam = (examId: number) => {
    setFailedExamId(null);
    startAttempt.mutate(examId, {
      onSuccess: (result) => {
        router.push(PRIVATE.DASHBOARD.EXAM_ATTEMPT(result.attemptId));
      },
      onError: () => setFailedExamId(examId),
    });
  };

  if (hall.isPending) {
    return (
      <p className="text-gray-9 py-20 text-center text-sm">
        응시장을 불러오는 중입니다
      </p>
    );
  }
  if (hall.isError) {
    return (
      <div
        className="border-red-3 bg-red-1 rounded-xl border p-6"
        role="alert"
      >
        <h2 className="text-red-10 text-sm font-extrabold">
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
      className="gap-block-gap mx-auto flex max-w-[980px] flex-col"
      data-testid="student-exam-hall"
    >
      {assigned.length > 0 && (
        <Card>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-gray-12 text-base font-extrabold">
              우리 반 시험
            </h2>
            <span className="text-gray-9 text-xs">선생님이 배정</span>
          </div>
          {assigned.map((exam) => (
            <div
              key={exam.attemptId}
              className="border-gray-2 flex flex-wrap items-center gap-3 border-b py-3 last:border-b-0"
            >
              <span className="text-gray-12 min-w-0 flex-1 text-[13px] font-semibold">
                {exam.title}
                <small className="text-gray-9 mt-1 block text-[11px] font-normal">
                  {exam.periodEnd
                    ? `${new Date(exam.periodEnd).toLocaleString('ko-KR')}까지`
                    : '마감 시각 없음'}{' '}
                  · {exam.questionCount}문항
                </small>
              </span>
              <span className="bg-orange-1 text-orange-10 rounded-full px-2.5 py-1 text-[11px] font-bold">
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
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-gray-12 text-base font-extrabold">공개 시험</h2>
          <span className="text-gray-9 text-xs">관리자 게시 · 누구나 응시</span>
        </div>
        {publicExams.map((exam) => {
          const isStarting =
            startAttempt.isPending && startAttempt.variables === exam.examId;
          return (
            <div
              key={exam.examId}
              className="border-gray-2 flex flex-wrap items-center gap-3 border-b py-3 last:border-b-0"
            >
              <span className="text-gray-12 min-w-0 flex-1 text-[13px] font-semibold">
                {exam.title}
                <small className="text-gray-9 mt-1 block text-[11px] font-normal">
                  {exam.questionCount}문항 ·{' '}
                  {exam.hasCutoff ? '전국 통계 있음' : 'AI 예측'}
                </small>
                {failedExamId === exam.examId && (
                  <small
                    className="text-red-10 mt-1 block text-[11px] font-bold"
                    role="alert"
                  >
                    지금은 응시를 시작할 수 없어요. 게시 기간이 끝났을 수
                    있습니다. 잠시 뒤 다시 눌러 주세요.
                  </small>
                )}
              </span>
              <span className="bg-gray-1 text-gray-10 rounded-full px-2.5 py-1 text-[11px] font-bold">
                공개
              </span>
              <Button
                size="xsmall"
                variant="outlined"
                disabled={isStarting}
                data-testid={`public-exam-start-${exam.examId}`}
                onClick={() => openPublicExam(exam.examId)}
              >
                {isStarting ? '여는 중' : '응시하기'}
              </Button>
            </div>
          );
        })}
        {publicExams.length === 0 && (
          <EmptyState
            className="my-block-gap"
            title="지금 공개된 시험이 없습니다"
          />
        )}
        <p className="text-gray-9 mt-3 text-[11px] leading-5">
          응시하기를 누르면 <b>우리 시험 응시 화면</b>이 열립니다. 시험지를 시간
          재고 통째로 푸는 일은 여기서 맡고, 한 문제씩 코치와 대화하며 푸는 일만
          오픈챌린지가 맡습니다.
        </p>
      </Card>

      {assigned.length === 0 && (
        <EmptyState
          title="우리 반 시험은 아직 없어요"
          description="선생님이 연결되면 선생님이 낸 시험이 위 칸에 먼저 뜹니다. 지금은 공개 시험으로 시작하면 됩니다."
          action={
            <Button
              asChild
              size="small"
            >
              <Link href={PRIVATE.DASHBOARD.CONNECTIONS}>선생님 연결하기</Link>
            </Button>
          }
        />
      )}
    </div>
  );
};

'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useStudentDashboardReportQuery } from '@/features/dashboard/hooks/use-student-dashboard-query';
import {
  useAssignedExamsQuery,
  useExamAnalysisQuery,
} from '@/features/exam/hooks/use-exam-query';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';

type Props = { className?: string };

export const ExamHallCard = ({ className }: Props) => {
  // 승인 디자인 v22 `locMeasured` 1754 `등급이 어떻게 나왔나요`
  const [isBasisOpen, setIsBasisOpen] = useState(false);
  const exams = useAssignedExamsQuery();
  const analyzedExam = exams.data?.find((exam) => exam.status === 'ANALYZED');
  const analysis = useExamAnalysisQuery(analyzedExam?.attemptId ?? 0, {
    enabled: Boolean(analyzedExam),
  });
  const report = useStudentDashboardReportQuery({
    enabled: !analyzedExam,
  });
  const pendingExam = exams.data?.find((exam) => exam.status !== 'ANALYZED');
  const reference = !analyzedExam ? report.data?.referenceExpectedGrade : null;

  if (
    exams.isPending ||
    (Boolean(analyzedExam) && analysis.isPending) ||
    (!analyzedExam && report.isPending)
  ) {
    return <Skeleton.Block className="h-64 w-full" />;
  }

  return (
    <section
      className={cn(
        'border-gray-3 p-card-pad rounded-card border bg-white',
        className
      )}
      data-testid="expected-grade-card"
    >
      {analysis.data ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-gray-12 text-sm font-extrabold">
              내 위치 ·{' '}
              {analysis.data.gradeBasis === 'MEASURED' ? '실측' : '예측'}
            </h3>
            <span className="bg-orange-2 text-orange-11 text-ui-choice rounded-full px-2.5 py-1 font-extrabold">
              {analysis.data.gradeBasis === 'MEASURED'
                ? '기준표 반영'
                : 'AI 예측'}
            </span>
            {analysis.data.gradeBasis === 'PREDICTED' && (
              <span className="border-gray-4 text-gray-10 text-ui-choice rounded-full border px-2.5 py-1 font-bold">
                실측 아님
              </span>
            )}
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              aria-expanded={isBasisOpen}
              onClick={() => setIsBasisOpen((current) => !current)}
              data-testid="expected-grade-basis-toggle"
              className="border-gray-3 text-gray-10 text-ui-choice min-h-control-sm rounded-button px-button-compact-x ml-auto cursor-pointer border font-bold"
            >
              등급이 어떻게 나왔나요
            </UnstyledButton>
          </div>
          {isBasisOpen && (
            <div
              className="border-gray-2 bg-gray-1 text-gray-10 text-ui-choice p-card-pad rounded-row mt-3 border leading-6"
              data-testid="expected-grade-basis"
            >
              <p>
                지금 이 등급은{' '}
                <b>
                  {analysis.data.gradeBasis === 'MEASURED'
                    ? '채점이 끝난 시험 결과(실측)'
                    : '아직 시험 없이 푼 문항 기록(예측)'}
                </b>
                를 근거로 나왔습니다.
              </p>
              <p className="mt-2">
                등급은 <b>범위</b>로만 씁니다. 문항 수가 단일 등급을 보증할 만큼
                많지 않기 때문입니다. 근거가 없으면 숫자를 쓰지 않고 다음에 할
                일을 대신 보여줍니다.
              </p>
              <ul className="mt-2 list-disc pl-4">
                {analysis.data.evidence.map((item) => (
                  <li key={`basis-${item.source}`}>{item.label}</li>
                ))}
              </ul>
              <p className="mt-2">{analysis.data.dataNotice}</p>
            </div>
          )}
          <p className="text-gray-12 font-title-heading mt-3 tabular-nums">
            {analysis.data.predictedGradeLow}~{analysis.data.predictedGradeHigh}
            등급
          </p>
          {analysis.data.standardScore !== null && (
            <p className="text-gray-10 mt-1 text-sm font-bold tabular-nums">
              표준점수 {analysis.data.standardScore}
            </p>
          )}
          <div className="divide-gray-2 border-gray-2 px-card-pad rounded-row mt-4 divide-y border">
            {analysis.data.evidence.map((item) => (
              <p
                key={item.source}
                className="text-gray-10 py-3 text-xs leading-5"
              >
                {item.label}
              </p>
            ))}
          </div>
          <p className="text-gray-8 text-ui-choice mt-3 leading-5">
            {analysis.data.dataNotice}
          </p>
        </>
      ) : reference ? (
        <div data-testid="expected-grade-reference">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-gray-12 text-sm font-extrabold">
              내 위치 · 참고
            </h3>
            <span className="bg-orange-2 text-orange-11 text-ui-choice rounded-full px-2.5 py-1 font-extrabold">
              시험 아님
            </span>
            <span className="border-gray-4 text-gray-10 text-ui-choice rounded-full border px-2.5 py-1 font-bold">
              {reference.gradedQuestionCount}문항 기준
            </span>
          </div>
          <p className="text-gray-12 font-title-heading mt-3 tabular-nums">
            {reference.predictedGradeLow}~{reference.predictedGradeHigh}등급
          </p>
          <div
            className="divide-gray-2 border-gray-2 px-card-pad rounded-row mt-4 divide-y border"
            data-testid="expected-grade-reference-evidence"
          >
            {reference.evidence.map((item) => (
              <p
                key={item.source}
                className="text-gray-10 py-3 text-xs leading-5"
              >
                {item.label}
              </p>
            ))}
          </div>
          <p className="text-gray-8 text-ui-choice mt-3 leading-5">
            {reference.dataNotice}
          </p>
        </div>
      ) : (
        <div data-testid="expected-grade-none">
          <h3 className="text-gray-12 text-sm font-extrabold">내 위치</h3>
          <p className="text-gray-12 mt-3 text-xl font-extrabold">
            아직 등급을 계산할 자료가 없어요
          </p>
          <p className="text-gray-8 mt-2 text-xs leading-6">
            추측으로 숫자를 만들지 않습니다. 아래 두 가지 중 하나만 하면 이
            자리에 내 위치가 들어옵니다.
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href={PUBLIC.OPEN_CHALLENGE.LIST}
              className="border-gray-3 text-gray-12 min-h-touch-min p-card-pad rounded-row flex items-center gap-3 border text-xs font-bold"
            >
              <span className="flex-1">
                문제를 풀어 내 위치 만들기
                <small className="text-gray-8 mt-1 block font-normal">
                  채점된 풀이가 쌓이면 참고 범위가 열려요
                </small>
              </span>
              <span className="text-orange-7">시작하기</span>
            </Link>
            <Link
              href={PRIVATE.DASHBOARD.EXAM_HALL}
              className="border-gray-3 text-gray-12 min-h-touch-min p-card-pad rounded-row flex items-center gap-3 border text-xs font-bold"
            >
              <span className="flex-1">
                공개 응시장에서 모의고사 응시
                <small className="text-gray-8 mt-1 block font-normal">
                  시험을 채점하면 시험 근거 범위가 열려요
                </small>
              </span>
              <span className="text-orange-7">보러 가기</span>
            </Link>
          </div>
        </div>
      )}

      <Link
        href={PRIVATE.DASHBOARD.EXAM_HALL}
        className="border-orange-4 bg-orange-1 text-orange-11 p-card-pad min-h-touch-min rounded-button mt-5 flex items-center gap-3 border text-xs font-bold"
      >
        <span className="flex-1">
          응시장 열기
          {pendingExam ? (
            <small className="text-gray-8 mt-1 block font-normal">
              배정된 시험 · {pendingExam.title}
            </small>
          ) : (
            <small className="text-gray-8 mt-1 block font-normal">
              지금 볼 수 있는 시험을 확인합니다
            </small>
          )}
        </span>
        {pendingExam && (
          <span className="bg-orange-7 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-white">
            새 시험
          </span>
        )}
        <span>›</span>
      </Link>
      {analyzedExam && (
        <Button
          asChild
          size="small"
          variant="outlined"
          className="mt-3 w-full"
        >
          <Link href={PRIVATE.DASHBOARD.EXAM_ATTEMPT(analyzedExam.attemptId)}>
            시험 분석 보기
          </Link>
        </Button>
      )}
    </section>
  );
};

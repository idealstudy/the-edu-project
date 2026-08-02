'use client';

import { useParentGradeSummaryQuery } from '@/features/exam/hooks/use-exam-query';
import { Skeleton } from '@/shared/components/loading';
import { cn } from '@/shared/lib';
import { ArrowRight, LockKeyhole, ShieldCheck, Sprout } from 'lucide-react';

type WeeklyReassuranceCardProps = {
  childId: number | null;
  className?: string;
};

export const WeeklyReassuranceCard = ({
  childId,
  className,
}: WeeklyReassuranceCardProps) => {
  const summaryQuery = useParentGradeSummaryQuery(childId, {
    enabled: childId !== null,
  });

  if (childId !== null && summaryQuery.isPending) {
    return <Skeleton.Block className="h-96 w-full" />;
  }

  const summary = summaryQuery.data;
  const childName = summary?.childName ?? '자녀';
  const hasGradeRange =
    summary?.predictedGradeLow !== null &&
    summary?.predictedGradeLow !== undefined;

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-5 md:p-6',
        className
      )}
      data-testid="parent-grade-summary-card"
    >
      <header className="border-gray-3 from-orange-1 rounded-2xl border bg-gradient-to-b to-white px-5 py-7 text-center">
        <span className="border-orange-3 text-orange-9 inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold">
          <ShieldCheck
            size={15}
            aria-hidden
          />
          디에듀가 보증하는 관리
        </span>
        <h3 className="font-headline2-heading text-gray-12 mt-3">
          {childName}의 성과
        </h3>
        <p className="font-body2-normal text-gray-8 mt-1">
          학습 변화 기록 · 주간 관리
        </p>
        <span className="bg-orange-1 text-orange-9 mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold">
          관리 기간 데이터 연결 전
        </span>
      </header>

      <p className="font-body2-normal text-gray-9 mx-1 mt-5 text-center leading-relaxed">
        전후 변화를 계산할 행동 기록이 아직 연결되지 않았어요.
        <br />
        기록이 쌓이면 <b className="text-gray-12">가장 크게 달라진 습관</b>부터
        보여드릴게요.
      </p>

      <h4 className="font-caption-heading text-gray-7 mt-6 tracking-wide">
        가장 큰 변화
      </h4>
      <div className="border-gray-3 mt-2 rounded-2xl border p-5">
        <p className="font-body2-heading text-gray-11">
          막혔을 때 해설을 여는 비율
        </p>
        <div className="mt-4 flex items-center gap-3 text-center">
          <div className="flex-1">
            <p className="font-caption-normal text-gray-7">관리 전</p>
            <p className="text-gray-7 mt-1 text-2xl font-extrabold">—</p>
          </div>
          <ArrowRight
            size={20}
            className="text-orange-5"
            aria-hidden
          />
          <div className="flex-1">
            <p className="font-caption-normal text-gray-7">지금</p>
            <p className="text-orange-7 mt-1 text-3xl font-extrabold">—</p>
          </div>
        </div>
        <div
          className="bg-gray-2 mt-4 flex h-2.5 overflow-hidden rounded-full"
          role="img"
          aria-label="전후 변화 데이터 미연결"
          data-testid="parent-before-after-track"
        >
          <div className="bg-gray-4 h-full w-0" />
          <div className="bg-orange-7 h-full w-0" />
        </div>
        <p className="font-caption-normal text-gray-8 mt-3 leading-relaxed">
          해설 열람 비율·스스로 고민한 시간의 전후 데이터가 현재 응답 계약에
          없습니다.
        </p>
      </div>

      <h4 className="font-caption-heading text-gray-7 mt-6 tracking-wide">
        함께 좋아진 것
      </h4>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <div className="border-gray-3 rounded-xl border p-4 text-center">
          <p className="font-caption-normal text-gray-7">예상 위치</p>
          <p className="font-body2-heading text-gray-11 mt-2">
            {hasGradeRange ? (
              <>
                <span className="text-gray-7">—</span>
                <ArrowRight
                  size={14}
                  className="text-orange-5 mx-1 inline"
                  aria-hidden
                />
                <span className="text-orange-8">
                  {summary.predictedGradeLow}~{summary.predictedGradeHigh}등급
                </span>
              </>
            ) : (
              '— → —'
            )}
          </p>
        </div>
        <div className="border-gray-3 rounded-xl border p-4 text-center">
          <p className="font-caption-normal text-gray-7">자습 꾸준함</p>
          <p className="font-body2-heading text-gray-11 mt-2">— → —</p>
        </div>
      </div>

      <div className="border-orange-3 bg-orange-1 mt-3 rounded-2xl border p-5">
        <div className="flex items-center gap-2">
          <span className="bg-orange-7 flex size-8 items-center justify-center rounded-full text-sm font-bold text-white">
            선
          </span>
          <div>
            <p className="font-body2-heading text-gray-11">선생님 한마디</p>
            <p className="font-caption-normal text-gray-7">
              담당 선생님 · 직접 작성
            </p>
          </div>
        </div>
        <p className="font-body2-normal text-gray-8 mt-3 leading-relaxed">
          아직 등록된 한마디가 없어요. 선생님 코멘트 계약이 연결되면 원문을
          그대로 보여드립니다.
        </p>
      </div>

      <div className="border-gray-3 mt-5 flex gap-2.5 rounded-xl border p-3.5">
        <ShieldCheck
          size={22}
          className="text-orange-7 shrink-0"
          aria-hidden
        />
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          <b className="text-gray-11">디에듀가 보장합니다</b> — 매주 증거 리포트
          · 자습 추적 · 약점 진단. 어느 주든 관리가 끊기지 않아요.
        </p>
      </div>
      <p className="font-caption-normal text-gray-7 mt-3 text-center leading-relaxed">
        성과 산출에 연결된 학습 기록 <b className="text-gray-9">0건</b> · 전후
        변화 계약이 연결되기 전에는 수치를 추정하지 않습니다.
      </p>

      {!summary || !hasGradeRange ? (
        <div className="border-gray-3 mt-5 flex flex-col items-center rounded-2xl border border-dashed px-5 py-8 text-center">
          <Sprout
            size={30}
            className="text-orange-6"
            aria-hidden
          />
          <p className="font-body2-heading text-gray-10 mt-3">
            첫 성과 카드는 곧 만들어져요
          </p>
          <p className="font-caption-normal text-gray-8 mt-1 leading-relaxed">
            전→후 변화를 보여드리려면 기록이 조금 더 필요해요.
          </p>
        </div>
      ) : (
        <p className="border-orange-3 bg-orange-1 text-orange-10 font-caption-normal mt-5 rounded-xl border p-3 text-center">
          {summary.reassuranceSummary}
        </p>
      )}

      <div className="border-gray-4 mt-4 flex gap-2 rounded-xl border p-3.5">
        <LockKeyhole
          size={17}
          className="text-gray-8 mt-0.5 shrink-0"
          aria-hidden
        />
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          {summary?.notice ??
            '아이가 매일 쓰는 회고와 문항별 답, 세부 활동은 부모님께 공유되지 않아요.'}
        </p>
      </div>
    </section>
  );
};

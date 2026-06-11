'use client';

import { useRouter } from 'next/navigation';

import { parentReport } from '@/entities/parent-report';
import { BackButton } from '@/shared/components/ui';
import {
  Brain,
  CalendarClock,
  GraduationCap,
  LifeBuoy,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import { useChildReportQuery } from '../hooks/use-parent-report';
import { MetricCard } from './metric-card';

const { helpers } = parentReport;

/* ─────────────────────────────────────────────────────
 * 날짜 문자열(ISO) → 한국어 라벨. 없거나 잘못되면 빈 문자열.
 * ────────────────────────────────────────────────────*/
const toDateLabel = (value: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

type ChildReportClientProps = {
  childId: number;
};

/* ─────────────────────────────────────────────────────
 * 자녀 학습 리포트 — 지표 3종 시각화 + 예상 등급 범위 + 활동 요약
 *  로딩 / 에러 / 빈(기간 내 활동 없음) / 정상 4상태.
 *  톤: 회고·격려. 고민시간·조교활용=긍정, 해설의존=주의, 등급은 "범위"로만(단정 X).
 * ────────────────────────────────────────────────────*/
export const ChildReportClient = ({ childId }: ChildReportClientProps) => {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useChildReportQuery(childId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-gray-1/40 h-9 w-40 animate-pulse rounded-[8px] motion-reduce:animate-none" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-line-line1 bg-gray-1/40 h-[160px] animate-pulse rounded-[12px] border motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="border-line-line1 flex flex-col items-center gap-3 rounded-[12px] border bg-white py-14 text-center">
        <TriangleAlert
          size={28}
          className="text-system-warning"
          aria-hidden
        />
        <p className="font-body2-heading text-text-main">
          리포트를 불러오지 못했어요.
        </p>
        <p className="font-caption-normal text-text-sub1 max-w-[360px] text-balance">
          연결되지 않은 자녀이거나 일시적인 오류일 수 있어요.
        </p>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="border-line-line1 font-label-heading text-text-sub1 flex h-11 items-center rounded-[8px] border px-5"
          >
            돌아가기
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-orange-7 font-label-heading flex h-11 items-center rounded-[8px] px-5 text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const periodLabel =
    toDateLabel(data.from) && toDateLabel(data.to)
      ? `${toDateLabel(data.from)} ~ ${toDateLabel(data.to)}`
      : '최근 30일';
  const hasActivity = data.totalCompleted > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 — 자녀 이름 + 집계 기간 */}
      <div className="flex flex-col gap-3">
        <BackButton />
        <div className="flex flex-col gap-1">
          <h2 className="font-headline1-heading text-text-main text-balance">
            {data.childName}님의 학습 리포트
          </h2>
          <p className="font-caption-normal text-text-sub1 tabular-nums">
            {periodLabel} · 완료한 문제{' '}
            <span className="tabular-nums">
              {data.totalCompleted.toLocaleString('ko-KR')}
            </span>
            개
          </p>
        </div>
      </div>

      {/* 기간 내 활동 없음 — graceful 빈 상태 */}
      {!hasActivity && (
        <div className="border-line-line1 bg-orange-1/40 flex items-start gap-3 rounded-[12px] border p-5">
          <Sparkles
            size={20}
            className="text-orange-7 mt-0.5 shrink-0"
            aria-hidden
          />
          <p className="font-caption-normal text-text-sub1 leading-relaxed">
            이 기간에는 아직 완료한 문제가 없어요. 한 문제씩 풀어 가면 고민시간과
            학습 흐름이 이곳에 쌓여요.
          </p>
        </div>
      )}

      {/* D1 지표 3종 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          tone="positive"
          icon={
            <Brain
              size={22}
              aria-hidden
            />
          }
          label="고민시간"
          value={helpers.toThinkingTimeLabel(data.avgThinkingTimeSecs)}
          helper="한 문제에 평균적으로 들인 시간이에요. 충분히 고민할수록 단단해져요."
        />
        <MetricCard
          tone="positive"
          icon={
            <LifeBuoy
              size={22}
              aria-hidden
            />
          }
          label="조교 활용도"
          value={`${helpers.toPercent(data.aiUsageRate)}%`}
          percent={data.aiUsageRate}
          helper="막힐 때 AI 조교에게 먼저 물어본 비율이에요. 스스로 길을 찾는 연습이에요."
        />
        <MetricCard
          tone="caution"
          icon={
            <GraduationCap
              size={22}
              aria-hidden
            />
          }
          label="해설 의존도"
          value={`${helpers.toPercent(data.solutionViewRate)}%`}
          percent={data.solutionViewRate}
          helper="정답 해설을 먼저 열어 본 비율이에요. 조금씩 줄여 가면 더 좋아요."
        />
      </div>

      {/* D2 예상 등급 범위 — "범위"로만, 단정 금지 */}
      <section
        className="border-line-line1 flex flex-col gap-2 rounded-[12px] border bg-white p-5"
        aria-label="예상 등급 범위"
      >
        <div className="flex items-center gap-2">
          <GraduationCap
            size={18}
            className="text-orange-7"
            aria-hidden
          />
          <span className="font-caption-heading text-text-sub1">
            예상 등급 범위
          </span>
        </div>
        <p className="font-title-heading text-text-main tabular-nums text-balance">
          {data.expectedGradeRange}
        </p>
        <p className="font-caption-normal text-text-sub2 leading-relaxed">
          자력 정답률로 가늠한 거친 추정 범위예요. 확정된 점수가 아니라 지금의
          흐름을 보는 참고선으로 봐 주세요.
        </p>
      </section>

      {/* 활동 요약 — 마지막 완료 */}
      {data.lastActivityAt && (
        <div className="text-text-sub2 flex items-center gap-2">
          <CalendarClock
            size={16}
            aria-hidden
          />
          <span className="font-caption-normal">
            마지막 학습 {toDateLabel(data.lastActivityAt)}
          </span>
        </div>
      )}
    </div>
  );
};

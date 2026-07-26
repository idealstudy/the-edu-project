'use client';

import { cn } from '@/shared/lib';

import type { WeeklyRetroSummary } from '../../mock/mvp-g-dashboard.mock';

type Props = {
  /**
   * 실 데이터가 준비되면 여기로 채운다. 없으면(=지금) "준비 중" 빈 상태만 그린다.
   * ⛔ 백엔드 계약 필요: 주간 AI 요약 배치(응시·할 일·오답·매일 회고 집계) API 부재.
   */
  summary?: WeeklyRetroSummary;
  className?: string;
};

/**
 * 주간 회고 — MVP-G v4 4번 블록. AI가 근거 인용과 함께 한 주를 먼저 요약하고
 * 학생은 반응만 하는 구조(백지 금지 원칙, Rosebud 문법 차용).
 * "선생님이 봅니다"는 정직하게 노출하되 부모 공유는 안 됨을 명시한다.
 */
export const WeeklyRetroCard = ({ summary, className }: Props) => {
  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
    >
      <h3 className="font-body1-heading text-gray-12">
        주간 회고
        <span className="font-body2-normal text-gray-8 ml-1.5">
          {summary?.rangeLabel ?? '일요일 저녁'}
        </span>
      </h3>

      {summary?.aiSummary ? (
        <div className="bg-orange-1 border-orange-3 mt-3 rounded-xl border p-4">
          <p className="font-caption-heading text-orange-9">
            🤖 AI 조교가 한 주를 먼저 정리했어요
          </p>
          <p className="font-body2-normal text-gray-11 mt-2 leading-relaxed">
            {summary.aiSummary}
          </p>
          {summary.evidenceTags && summary.evidenceTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {summary.evidenceTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-white border-orange-3 text-orange-8 font-caption-heading rounded-md border px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-8 text-center">
          <p className="font-body2-heading text-gray-10">준비 중이에요</p>
          <p className="font-caption-normal text-gray-8">
            한 주 데이터가 쌓이면 일요일 저녁 AI가 먼저 정리해줘요
          </p>
        </div>
      )}

      <p className="font-caption-normal text-gray-7 mt-3 leading-relaxed">
        이 요약과 내 반응은 <b className="text-gray-9">선생님</b>이 상담·수업
        준비에 봐요. 부모님께는 가지 않아요 — 솔직하게 써도 괜찮아요.
      </p>
    </section>
  );
};

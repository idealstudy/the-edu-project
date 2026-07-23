'use client';

import { cn } from '@/shared/lib';

import {
  TODO_SOURCE_LABEL,
  type TodaySummary,
} from '../../mock/mvp-g-dashboard.mock';

type Props = {
  /**
   * 실 데이터가 준비되면 여기로 채운다. 없으면(=지금) "준비 중" 빈 상태만 그린다.
   * ⛔ 백엔드 계약 필요: 선생님·응시장·오픈챌린지 통합 피드 API 부재.
   */
  summary?: TodaySummary;
  className?: string;
};

const SOURCE_BADGE_CLASS: Record<string, string> = {
  teacher: 'bg-green-50 text-green-700',
  'exam-hall': 'bg-orange-2 text-orange-7',
  'open-challenge': 'bg-gray-2 text-gray-8',
};

/**
 * 오늘 할 일 — MVP-G v3 학생 대시보드 ③ 블록. 선생님·응시장·오픈챌린지 통합 피드.
 * 실측 없는 진행률·리워드 숫자는 렌더하지 않는다(회장 지시 2026-07-23).
 */
export const TodayTodoCard = ({ summary, className }: Props) => {
  const items = summary?.items ?? [];

  if (items.length === 0) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col gap-1 rounded-2xl border p-6',
          className
        )}
      >
        <h3 className="font-body1-heading text-gray-12">오늘 할 일</h3>
        <div className="border-gray-2 bg-gray-1 mt-3 flex flex-col items-center gap-1 rounded-xl border py-8 text-center">
          <p className="font-body2-heading text-gray-10">준비 중이에요</p>
          <p className="font-caption-normal text-gray-8">
            선생님이 과제를 올리거나 시험지가 배정되면 여기 쌓여요
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
    >
      <h3 className="font-body1-heading text-gray-12">
        오늘 할 일
        {summary?.dateLabel && (
          <span className="font-body2-normal text-gray-8 ml-1.5">
            {summary.dateLabel}
          </span>
        )}
      </h3>

      <ul className="mt-2 flex flex-col">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-gray-2 flex items-start gap-3.5 border-b py-3.5 last:border-b-0 last:pb-1"
          >
            <span
              aria-hidden
              className={cn(
                'mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md border-2',
                item.done
                  ? 'bg-orange-7 border-orange-7 text-white'
                  : 'border-gray-4'
              )}
            >
              {item.done && '✓'}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'font-body2-heading text-gray-12',
                  item.done && 'text-gray-8 line-through'
                )}
              >
                {item.title}
              </p>
              <p className="font-caption-normal text-gray-8 mt-1 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    'font-caption-heading rounded-full px-2 py-0.5',
                    SOURCE_BADGE_CLASS[item.source]
                  )}
                >
                  {TODO_SOURCE_LABEL[item.source]}
                </span>
                {item.meta}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

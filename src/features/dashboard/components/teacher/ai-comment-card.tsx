'use client';

import { cn } from '@/shared/lib';

import type { TeacherAiCommentSummary } from '../../mock/mvp-g-dashboard.mock';

type Props = {
  /**
   * 실 데이터가 준비되면 여기로 채운다. 없으면(=지금) "준비 중" 빈 상태만 그린다.
   * ⛔ 백엔드 계약 필요: 학생별 주간 AI 코멘트 배치(학생 본인이 본 요약과 동일 원문) API 부재.
   */
  summary?: TeacherAiCommentSummary;
  className?: string;
};

/**
 * 교사 — 이번 주 AI 코멘트 — MVP-G v4 신규. 월요일 아침 상담·수업 준비의 첫 화면.
 * 학생 본인이 본 회고 요약과 "동일한 원문"을 교사에게도 노출(왜곡 없음 원칙).
 */
export const AiCommentCard = ({ summary, className }: Props) => {
  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
    >
      <h3 className="font-body1-heading text-gray-12">
        이번 주 AI 코멘트
        <span className="font-body2-normal text-gray-8 ml-1.5">
          {summary?.weekRangeLabel ?? '월요일 아침'} · 학생 본인이 본 요약과
          동일한 원문
        </span>
      </h3>

      {summary?.comments && summary.comments.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-3">
          {summary.comments.map((c) => (
            <li
              key={c.studentName}
              className="border-gray-2 bg-gray-1 rounded-xl border p-4"
            >
              <p className="font-body2-heading text-gray-12">
                {c.studentName}
              </p>
              <p className="font-body2-normal text-gray-9 mt-1.5 leading-relaxed">
                {c.comment}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.evidenceTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-white border-orange-3 text-orange-8 font-caption-heading rounded-md border px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-8 text-center">
          <p className="font-body2-heading text-gray-10">준비 중이에요</p>
          <p className="font-caption-normal text-gray-8">
            학생 회고·응시 데이터가 쌓이면 매주 월요일 여기 요약이 도착해요
          </p>
        </div>
      )}

      <p className="font-caption-normal text-gray-7 mt-3 leading-relaxed">
        🔒 AI 코멘트·회고는 <b className="text-gray-9">학생 본인과 선생님만</b>{' '}
        봅니다. 학부모 주간 카드에는 넘어가지 않아요.
      </p>
    </section>
  );
};

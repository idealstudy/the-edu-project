'use client';

import { useState } from 'react';

import type { WrongAnswerItem } from '@/entities/wrong-answer';
import { useTeacherWrongAnswerInboxQuery } from '@/features/dashboard/hooks/use-wrong-answer-query';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { AlertTriangle, Check, Clock3, Inbox } from 'lucide-react';

type QuickComment = '그게 실력이다, 유지하자' | '쌍둥이 하나 더';

const QUICK_COMMENTS: QuickComment[] = [
  '그게 실력이다, 유지하자',
  '쌍둥이 하나 더',
];

const InboxItem = ({
  item,
  selectedComment,
  onSelectComment,
}: {
  item: WrongAnswerItem;
  selectedComment?: QuickComment;
  onSelectComment: (comment: QuickComment) => void;
}) => (
  <li className="border-gray-2 border-b py-4 last:border-b-0">
    <p className="font-body2-heading text-gray-11">
      학생 {item.studentId} · {item.title ?? `오답 ${item.id}`}
    </p>
    <p className="font-caption-normal text-gray-7 mt-1">
      {item.status === 'GRADUATED'
        ? `5회독 뒤에도 다시 틀림 · 힌트 없이 ${item.hintFreeSolveCount}회 해결`
        : `${item.reviewCount}회독 진행 · 다시 틀림 ${item.wrongAgainCount}회`}
    </p>
    <div
      className="mt-3 flex flex-wrap gap-1.5"
      aria-label={`${item.title ?? `오답 ${item.id}`} 빠른 코멘트`}
    >
      {QUICK_COMMENTS.map((comment) => {
        const isSelected = selectedComment === comment;
        return (
          <button
            key={comment}
            type="button"
            className={cn(
              'border-orange-3 hover:border-orange-7 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
              isSelected
                ? 'bg-orange-7 text-white'
                : 'bg-gray-white text-orange-9'
            )}
            aria-pressed={isSelected}
            onClick={() => onSelectComment(comment)}
            data-testid={`teacher-inbox-quick-comment-${item.id}`}
          >
            {isSelected && (
              <Check
                size={13}
                className="mr-1 inline"
                aria-hidden
              />
            )}
            {comment}
          </button>
        );
      })}
      <Button
        size="xsmall"
        variant="outlined"
        disabled
      >
        직접 쓰기
      </Button>
    </div>
    <p className="font-caption-normal text-gray-7 mt-2 leading-relaxed">
      선택한 칩은 화면에만 표시됩니다. 발행 API 연결 전이며, 미처리 시 내일
      09:00 AI 코멘트 자동 발행 정책을 적용하려면 백엔드 계약이 필요합니다.
    </p>
  </li>
);

export const LearningInboxCard = () => {
  const inboxQuery = useTeacherWrongAnswerInboxQuery();
  const [selectedComments, setSelectedComments] = useState<
    Record<number, QuickComment>
  >({});

  if (inboxQuery.isPending) return <Skeleton.Block className="h-44 w-full" />;

  const inbox = inboxQuery.data;
  if (
    !inbox ||
    (inbox.neglectedCount === 0 && inbox.stuckAfterGraduationCount === 0)
  ) {
    return (
      <section className="border-gray-3 bg-gray-white rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <Inbox
            size={20}
            className="text-gray-7"
            aria-hidden
          />
          <h3 className="font-body1-heading text-gray-12">처리함</h3>
        </div>
        <p className="font-body2-normal text-gray-8 mt-3">
          지금 확인할 방치 오답이나 5회독 실패 신호가 없어요.
        </p>
        <div className="border-gray-3 bg-gray-1 mt-4 rounded-xl border p-4">
          <p className="font-body2-heading text-gray-10">할 일 승인 0</p>
          <p className="font-caption-normal text-gray-7 mt-1">
            AI 추천 할 일 계약이 연결되면 「이대로 꽂기 / 고쳐서」 1클릭 승인이
            여기에 표시됩니다.
          </p>
        </div>
      </section>
    );
  }

  const items = [...inbox.neglected, ...inbox.stuckAfterGraduation].filter(
    (item, index, allItems) =>
      allItems.findIndex((candidate) => candidate.id === item.id) === index
  );

  return (
    <section
      className="border-gray-3 bg-gray-white rounded-xl border p-5 md:p-6"
      data-testid="teacher-learning-inbox"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-body1-heading text-gray-12">처리함</h3>
          <p className="font-caption-normal text-gray-7 mt-1">
            오답 코멘트는 칩 한 번, 추천 할 일은 승인 한 번으로 처리합니다.
          </p>
        </div>
        <span className="border-orange-3 bg-orange-1 text-orange-10 rounded-full border px-3 py-1 text-xs font-bold">
          오답 코멘트 {items.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <Clock3
              size={18}
              className="text-amber-700"
              aria-hidden
            />
            <p className="font-body2-heading text-gray-11">
              {inbox.neglectedThresholdDays}일 방치 · {inbox.neglectedCount}건
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-red-700"
              aria-hidden
            />
            <p className="font-body2-heading text-gray-11">
              5번 풀고도 못 맞힘 · {inbox.stuckAfterGraduationCount}건
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-2">
        {items.slice(0, 4).map((item) => (
          <InboxItem
            key={item.id}
            item={item}
            selectedComment={selectedComments[item.id]}
            onSelectComment={(comment) =>
              setSelectedComments((current) => ({
                ...current,
                [item.id]: comment,
              }))
            }
          />
        ))}
      </ul>

      <div
        className="border-gray-3 bg-gray-1 mt-4 rounded-xl border p-4"
        data-testid="teacher-todo-approval"
      >
        <p className="font-body2-heading text-gray-10">할 일 승인 0</p>
        <p className="font-caption-normal text-gray-7 mt-1 leading-relaxed">
          AI 추천 할 일 데이터가 아직 없습니다. 연결되면 추천 근거와 함께 1클릭
          승인합니다.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            size="xsmall"
            disabled
          >
            이대로 꽂기
          </Button>
          <Button
            size="xsmall"
            variant="outlined"
            disabled
          >
            고쳐서
          </Button>
        </div>
        <p className="font-caption-normal text-gray-7 mt-2">
          미처리 시 내일 09:00 자동 발행 폴백도 백엔드 스케줄 계약이 필요합니다.
        </p>
      </div>
    </section>
  );
};

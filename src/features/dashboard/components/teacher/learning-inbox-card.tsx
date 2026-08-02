'use client';

import { useTeacherWrongAnswerInboxQuery } from '@/features/dashboard/hooks/use-wrong-answer-query';
import { Skeleton } from '@/shared/components/loading';
import { AlertTriangle, Clock3, Inbox } from 'lucide-react';

export const LearningInboxCard = () => {
  const inboxQuery = useTeacherWrongAnswerInboxQuery();
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
      </section>
    );
  }

  return (
    <section
      className="border-gray-3 bg-gray-white rounded-xl border p-6"
      data-testid="teacher-learning-inbox"
    >
      <h3 className="font-body1-heading text-gray-12">처리함</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
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
          <ul className="font-caption-normal text-gray-8 mt-2 space-y-1">
            {inbox.neglected.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="truncate"
              >
                학생 {item.studentId} · {item.title ?? `오답 ${item.id}`}
              </li>
            ))}
          </ul>
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
          <ul className="font-caption-normal text-gray-8 mt-2 space-y-1">
            {inbox.stuckAfterGraduation.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="truncate"
              >
                학생 {item.studentId} · {item.title ?? `오답 ${item.id}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

'use client';

import { FormEvent, useState } from 'react';

import type { TodoItem } from '@/entities/todo';
import { Skeleton } from '@/shared/components/loading';
import { Button, Input, showBottomToast } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyTodoError } from '@/shared/lib/errors/errors';
import { Check, CircleX, ListChecks, RefreshCw } from 'lucide-react';

import {
  useStudentTodosQuery,
  useUpdateTodo,
} from '../../hooks/use-todo-query';

type Props = {
  className?: string;
};

type TodoSupply = 'TEACHER' | 'EXAM_HALL' | 'OPEN_CHALLENGE' | 'STUDENT';

const SUPPLY_LABEL: Record<TodoSupply, string> = {
  TEACHER: '선생님',
  EXAM_HALL: '응시장',
  OPEN_CHALLENGE: '오픈챌린지',
  STUDENT: '학생',
};

const SUPPLY_STYLE: Record<TodoSupply, string> = {
  TEACHER: 'bg-green-50 text-green-800',
  EXAM_HALL: 'bg-orange-1 text-orange-10',
  OPEN_CHALLENGE: 'bg-gray-2 text-gray-9',
  STUDENT: 'border-gray-4 bg-white text-gray-7 border',
};

const STATUS_LABEL: Record<TodoItem['status'], string> = {
  TODO: '할 일',
  DONE: '완료',
  SKIPPED: '못함',
};

const formatMonthDay = (date: string) => {
  const [, month = '', day = ''] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
};

const getTodoSupply = (item: TodoItem): TodoSupply => item.source;

const getTodoMeta = (item: TodoItem) =>
  [item.subject, item.book].filter(Boolean).join(' · ') ||
  (item.source === 'TEACHER'
    ? '선생님이 배정한 계획'
    : item.source === 'EXAM_HALL'
      ? '배정된 시험 응시 계획'
      : item.source === 'OPEN_CHALLENGE'
        ? '약점 기록 기반 추천'
        : '학생이 직접 입력한 계획');

const TodoCardLoading = ({ className }: Props) => (
  <section
    className={cn(
      'bg-gray-white border-gray-4 flex flex-col gap-3 rounded-xl border p-6',
      className
    )}
    data-testid="student-todos-loading"
  >
    <Skeleton.Block className="h-6 w-32" />
    <Skeleton.Block className="h-2 w-full" />
    <Skeleton.Block className="h-16 w-full" />
    <Skeleton.Block className="h-16 w-full" />
  </section>
);

export const TodayTodoCard = ({ className }: Props) => {
  const todosQuery = useStudentTodosQuery();
  const updateTodo = useUpdateTodo();
  const [skipTodoId, setSkipTodoId] = useState<number | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (todosQuery.isPending) {
    return <TodoCardLoading className={className} />;
  }

  if (todosQuery.isError) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col items-center rounded-xl border px-6 py-10 text-center',
          className
        )}
        data-testid="student-todos-error"
      >
        <RefreshCw
          size={30}
          className="text-gray-6"
          aria-hidden
        />
        <h3 className="font-body1-heading text-gray-12 mt-3">
          오늘 할 일을 불러오지 못했어요
        </h3>
        <p className="font-body2-normal text-gray-8 mt-1">
          잠시 후 다시 시도해주세요.
        </p>
        <Button
          size="small"
          variant="outlined"
          className="mt-5"
          onClick={() => void todosQuery.refetch()}
        >
          다시 불러오기
        </Button>
      </section>
    );
  }

  const summary = todosQuery.data;
  const items = summary.items;
  const progressPercent =
    summary.totalCount === 0
      ? 0
      : Math.round((summary.doneCount / summary.totalCount) * 100);
  const totalRewardPoints = items.reduce(
    (sum, item) => sum + item.rewardPoints,
    0
  );
  const handleMutationError = (error: unknown) => {
    handleApiError(error, classifyTodoError, {
      onField: setFormError,
      onContext: setFormError,
      onUnknown: setFormError,
    });
  };
  const handleComplete = (item: TodoItem) => {
    setFormError(null);
    updateTodo.mutate(
      { id: item.id, input: { status: 'DONE' } },
      {
        onSuccess: () => showBottomToast('완료로 기록했어요.'),
        onError: handleMutationError,
      }
    );
  };
  const handleSkip = (event: FormEvent<HTMLFormElement>, item: TodoItem) => {
    event.preventDefault();
    const trimmedReason = skipReason.trim();
    if (!trimmedReason) {
      setFormError('못한 이유를 남겨주세요.');
      return;
    }

    setFormError(null);
    updateTodo.mutate(
      {
        id: item.id,
        input: { status: 'SKIPPED', skipReason: trimmedReason },
      },
      {
        onSuccess: () => {
          setSkipTodoId(null);
          setSkipReason('');
          showBottomToast('못한 이유를 기록했어요.');
        },
        onError: handleMutationError,
      }
    );
  };

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-xl border p-5 md:p-6',
        className
      )}
      aria-labelledby="student-todos-title"
      data-testid="student-todos-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="student-todos-title"
            className="font-body1-heading text-gray-12"
          >
            오늘 할 일
            <span className="font-body2-normal text-gray-7 ml-2">
              {formatMonthDay(summary.weekOf)}–{formatMonthDay(summary.weekEnd)}
            </span>
          </h3>
          <p className="font-caption-normal text-gray-8 mt-1">
            선생님·응시장·오픈챌린지가 채워주고, 학생은 실행에 집중해요.
          </p>
        </div>
        <span className="bg-orange-1 border-orange-3 text-orange-10 rounded-full border px-3 py-1.5 text-xs font-bold">
          {summary.totalCount - summary.doneCount - summary.skippedCount}개 남음
        </span>
      </div>

      <div
        className="mt-3 flex flex-wrap gap-1.5"
        aria-label="할 일 공급원"
        data-testid="student-todo-supply-legend"
      >
        {(['TEACHER', 'EXAM_HALL', 'OPEN_CHALLENGE'] as const).map((supply) => (
          <span
            key={supply}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-bold',
              SUPPLY_STYLE[supply]
            )}
          >
            {SUPPLY_LABEL[supply]}
          </span>
        ))}
      </div>

      <div className="bg-gray-2 mt-4 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-orange-7 h-full rounded-full transition-[width]"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-label="오늘 할 일 진행률"
          aria-valuemin={0}
          aria-valuemax={summary.totalCount}
          aria-valuenow={summary.doneCount}
          data-testid="student-todo-progress"
        />
      </div>
      <p className="font-caption-normal text-gray-7 mt-1.5 tabular-nums">
        {summary.doneCount} / {summary.totalCount} 완료 · 다 끝내면 오늘 +
        {totalRewardPoints}P
      </p>

      {items.length === 0 ? (
        <div
          className="border-gray-3 mt-4 flex flex-col items-center rounded-xl border border-dashed px-5 py-9 text-center"
          data-testid="student-todos-empty"
        >
          <ListChecks
            size={32}
            className="text-gray-6"
            aria-hidden
          />
          <p className="font-body2-heading text-gray-10 mt-3">
            오늘 배정된 할 일이 아직 없어요
          </p>
          <p className="font-caption-normal text-gray-8 mt-1 leading-relaxed">
            선생님이 과제를 올리거나 시험·오픈챌린지 공급원이 연결되면 여기
            쌓여요.
          </p>
          <Button
            className="mt-4"
            disabled
          >
            기출 1세트 풀고 오늘 할 일 채우기 (+20P)
          </Button>
        </div>
      ) : (
        <ul
          className="mt-2 flex flex-col"
          data-testid="student-todos-list"
        >
          {items.map((item) => {
            const isResolved = item.status !== 'TODO';
            const isSkipping = skipTodoId === item.id;
            const supply = getTodoSupply(item);

            return (
              <li
                key={item.id}
                className="border-gray-2 flex flex-col border-b py-4 last:border-b-0"
                data-testid={`student-todo-${item.id}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-2',
                      item.status === 'DONE'
                        ? 'bg-orange-7 border-orange-7 text-white'
                        : item.status === 'SKIPPED'
                          ? 'border-gray-5 bg-gray-2 text-gray-8'
                          : 'border-gray-4 hover:border-orange-7'
                    )}
                    aria-label={`${item.title} 완료 처리`}
                    disabled={isResolved || updateTodo.isPending}
                    onClick={() => handleComplete(item)}
                    data-testid={`student-todo-complete-${item.id}`}
                  >
                    {item.status === 'DONE' && (
                      <Check
                        size={15}
                        aria-hidden
                      />
                    )}
                    {item.status === 'SKIPPED' && (
                      <CircleX
                        size={15}
                        aria-hidden
                      />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'font-body2-heading text-gray-12 break-words',
                        isResolved && 'text-gray-8 line-through'
                      )}
                    >
                      {item.title}
                    </p>
                    <div className="font-caption-normal text-gray-8 mt-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-bold',
                          SUPPLY_STYLE[supply]
                        )}
                      >
                        {SUPPLY_LABEL[supply]}
                      </span>
                      <span>{getTodoMeta(item)}</span>
                      {isResolved && (
                        <span className="font-caption-heading text-gray-9">
                          · {STATUS_LABEL[item.status]}
                        </span>
                      )}
                    </div>
                    {item.status === 'SKIPPED' && item.skipReason && (
                      <p className="bg-gray-1 text-gray-9 font-caption-normal mt-2 rounded-lg px-3 py-2">
                        못한 이유: {item.skipReason}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-orange-7 text-xs font-extrabold tabular-nums">
                      +{item.rewardPoints}P{item.status === 'DONE' ? ' ✓' : ''}
                    </span>
                    {!isResolved && (
                      <Button
                        size="xsmall"
                        variant="outlined"
                        className="h-8 px-2.5"
                        disabled={updateTodo.isPending}
                        onClick={() => {
                          setFormError(null);
                          setSkipTodoId(isSkipping ? null : item.id);
                          setSkipReason('');
                        }}
                        data-testid={`student-todo-skip-${item.id}`}
                      >
                        못했어요
                      </Button>
                    )}
                  </div>
                </div>

                {isSkipping && (
                  <form
                    className="border-orange-3 bg-orange-1 mt-3 ml-9 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row"
                    onSubmit={(event) => handleSkip(event, item)}
                    data-testid={`student-todo-skip-form-${item.id}`}
                  >
                    <Input
                      value={skipReason}
                      onChange={(event) => setSkipReason(event.target.value)}
                      maxLength={200}
                      placeholder="못한 이유를 짧게 남겨주세요"
                      className="h-10 flex-1 bg-white px-3"
                      aria-label="못한 이유"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="xsmall"
                      disabled={updateTodo.isPending}
                    >
                      이유 저장
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="border-gray-3 bg-gray-1 font-caption-normal text-gray-8 mt-4 rounded-xl border p-3 leading-relaxed">
        완료 포인트는 공급원별 저장값으로 적립됩니다. 선생님 15P · 응시장 20P
        · 오픈챌린지 5P · 학생 직접 입력 0P가 기본값입니다.
      </p>

      {formError && (
        <p
          className="text-system-warning font-caption-normal mt-3"
          role="alert"
          data-testid="student-todo-form-error"
        >
          {formError}
        </p>
      )}
    </section>
  );
};

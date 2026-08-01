'use client';

import { FormEvent, useState } from 'react';

import type { TodoItem } from '@/entities/todo';
import { Skeleton } from '@/shared/components/loading';
import { Button, Input, Prompt, showBottomToast } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyTodoError } from '@/shared/lib/errors/errors';
import {
  Check,
  CircleX,
  ListChecks,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import {
  useCreateTodo,
  useDeleteTodo,
  useStudentTodosQuery,
  useUpdateTodo,
} from '../../hooks/use-todo-query';

type Props = {
  className?: string;
};

const QUICK_TODO_SUGGESTIONS = [
  '오답 3문제 다시 풀기',
  '수업노트 10분 복습',
  '영단어 30개 외우기',
] as const;

const STATUS_LABEL: Record<TodoItem['status'], string> = {
  TODO: '할 일',
  DONE: '완료',
  SKIPPED: '못함',
};

const formatMonthDay = (date: string) => {
  const [, month = '', day = ''] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
};

const getTodoMeta = (item: TodoItem) =>
  [item.subject, item.book].filter(Boolean).join(' · ') ||
  (item.assignerRole === 'TEACHER' ? '선생님이 배정한 계획' : '내가 세운 계획');

const TodoCardLoading = ({ className }: Props) => (
  <section
    className={cn(
      'bg-gray-white border-gray-4 flex flex-col gap-3 rounded-2xl border p-6',
      className
    )}
    data-testid="student-todos-loading"
  >
    <Skeleton.Block className="h-6 w-32" />
    <Skeleton.Block className="h-16 w-full" />
    <Skeleton.Block className="h-16 w-full" />
    <Skeleton.Block className="h-10 w-full" />
  </section>
);

export const TodayTodoCard = ({ className }: Props) => {
  const todosQuery = useStudentTodosQuery();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [skipTodoId, setSkipTodoId] = useState<number | null>(null);
  const [skipReason, setSkipReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<TodoItem | null>(null);

  if (todosQuery.isPending) {
    return <TodoCardLoading className={className} />;
  }

  if (todosQuery.isError) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col items-center rounded-2xl border px-6 py-10 text-center',
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
          이번 주 할 일을 불러오지 못했어요
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
  const isMutating =
    createTodo.isPending || updateTodo.isPending || deleteTodo.isPending;
  const handleMutationError = (error: unknown) => {
    handleApiError(error, classifyTodoError, {
      onField: setFormError,
      onContext: setFormError,
      onUnknown: setFormError,
    });
  };
  const createTodoWithTitle = (title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('할 일을 한 글자 이상 입력해주세요.');
      return;
    }

    setFormError(null);
    createTodo.mutate(
      { title: trimmedTitle },
      {
        onSuccess: () => {
          setNewTodoTitle('');
          showBottomToast('이번 주 할 일에 추가했어요.');
        },
        onError: handleMutationError,
      }
    );
  };
  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTodoWithTitle(newTodoTitle);
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
  const handleDelete = () => {
    if (!todoToDelete) return;

    deleteTodo.mutate(todoToDelete.id, {
      onSuccess: () => {
        setTodoToDelete(null);
        showBottomToast('할 일을 삭제했어요.');
      },
    });
  };

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
      aria-labelledby="student-todos-title"
      data-testid="student-todos-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            id="student-todos-title"
            className="font-body1-heading text-gray-12"
          >
            오늘 할 일
          </h3>
          <p className="font-caption-normal text-gray-8 mt-1">
            이번 주 {formatMonthDay(summary.weekOf)}–
            {formatMonthDay(summary.weekEnd)} · {summary.doneCount}/
            {summary.totalCount} 완료
          </p>
        </div>
        <span className="bg-orange-1 border-orange-3 text-orange-10 font-caption-heading rounded-full border px-3 py-1.5">
          {summary.totalCount - summary.doneCount - summary.skippedCount}개 남음
        </span>
      </div>

      <div className="bg-gray-2 mt-4 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-orange-7 h-full rounded-full transition-[width]"
          style={{
            width: `${summary.totalCount === 0 ? 0 : Math.round((summary.doneCount / summary.totalCount) * 100)}%`,
          }}
          aria-hidden
        />
      </div>

      {items.length === 0 ? (
        <div
          className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-8 text-center"
          data-testid="student-todos-empty"
        >
          <ListChecks
            size={30}
            className="text-gray-6"
            aria-hidden
          />
          <p className="font-body2-heading text-gray-10 mt-2">
            이번 주 할 일이 아직 없어요
          </p>
          <p className="font-caption-normal text-gray-8">
            아래 빠른 입력이나 자유 입력으로 첫 계획을 넣어보세요.
          </p>
        </div>
      ) : (
        <ul
          className="mt-2 flex flex-col"
          data-testid="student-todos-list"
        >
          {items.map((item) => {
            const isResolved = item.status !== 'TODO';
            const isSkipping = skipTodoId === item.id;

            return (
              <li
                key={item.id}
                className="border-gray-2 flex flex-col border-b py-3.5 last:border-b-0"
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
                    disabled={isResolved || isMutating}
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
                          'font-caption-heading rounded-full px-2 py-0.5',
                          item.assignerRole === 'TEACHER'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-white border-orange-6 text-orange-9 border border-dashed'
                        )}
                      >
                        {item.assignerRole === 'TEACHER' ? '선생님' : '내가'}
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

                  <div className="flex shrink-0 items-center gap-1">
                    {!isResolved && (
                      <Button
                        size="xsmall"
                        variant="outlined"
                        className="h-8 px-2.5"
                        disabled={isMutating}
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
                    <button
                      type="button"
                      className="text-gray-7 hover:bg-gray-1 hover:text-gray-11 flex size-8 cursor-pointer items-center justify-center rounded-lg"
                      aria-label={`${item.title} 삭제`}
                      disabled={isMutating}
                      onClick={() => setTodoToDelete(item)}
                      data-testid={`student-todo-delete-${item.id}`}
                    >
                      <Trash2
                        size={16}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>

                {isSkipping && (
                  <form
                    className="border-orange-3 bg-orange-1 tablet:flex-row mt-3 ml-9 flex flex-col gap-2 rounded-xl border p-3"
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

      <div className="border-orange-3 bg-orange-1 mt-4 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <Plus
            size={18}
            className="text-orange-8"
            aria-hidden
          />
          <p className="font-body2-heading text-orange-10">할 일 추가</p>
        </div>
        <p className="font-caption-normal text-gray-8 mt-1">
          빠른 입력을 누르거나 직접 적어 이번 주 계획에 넣어요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_TODO_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className="border-orange-3 bg-gray-white text-gray-10 hover:border-orange-7 hover:text-orange-10 font-caption-heading cursor-pointer rounded-full border border-dashed px-3 py-2 text-left"
              disabled={createTodo.isPending}
              onClick={() => createTodoWithTitle(suggestion)}
              data-testid={`student-todo-suggestion-${index + 1}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          className="tablet:flex-row mt-3 flex flex-col gap-2"
          onSubmit={handleCreate}
          data-testid="student-todo-create-form"
        >
          <Input
            value={newTodoTitle}
            onChange={(event) => setNewTodoTitle(event.target.value)}
            maxLength={120}
            placeholder="예: 물리 오답노트 정리"
            className="h-11 flex-1 bg-white px-3"
            aria-label="새 할 일"
            data-testid="student-todo-title-input"
          />
          <Button
            type="submit"
            size="xsmall"
            className="h-11"
            disabled={createTodo.isPending}
            data-testid="student-todo-create-button"
          >
            추가하기
          </Button>
        </form>
        <p className="font-caption-normal text-gray-8 mt-2">
          직접 넣은 계획에는 「내가」 라벨이 붙어요.
        </p>
      </div>

      {formError && (
        <p
          className="text-system-warning font-caption-normal mt-3"
          role="alert"
          data-testid="student-todo-form-error"
        >
          {formError}
        </p>
      )}

      <Prompt
        isOpen={Boolean(todoToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTodoToDelete(null);
        }}
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>이 할 일을 삭제할까요?</Prompt.Title>
            <Prompt.Description className="text-gray-8 text-center">
              {todoToDelete?.title}
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>취소</Prompt.Cancel>
            <Prompt.Action
              onClick={handleDelete}
              disabled={deleteTodo.isPending}
            >
              삭제
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </section>
  );
};

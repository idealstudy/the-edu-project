'use client';

import { useState } from 'react';

import Link from 'next/link';

import { PRIVATE } from '@/shared/constants/route';

import { useStudentTodosQuery } from '../../hooks/use-todo-query';
import { TodayTodoCard } from './today-todo-card';

export const AgendaFlowCard = () => {
  // 시안 v23 `agflow.two .hd`(HTML:640-641): 공유헤더에 진행 카운트 + ＋추가 + 돌아보기.
  // ＋추가는 today-todo-card의 기존 add 폼을 그대로 트리거한다(로직 변경 없음, 위치만 이동).
  const [isAdding, setIsAdding] = useState(false);
  const todosQuery = useStudentTodosQuery();
  const summary = todosQuery.data;
  const progressLabel =
    summary && !todosQuery.isError
      ? `${summary.doneCount} / ${summary.totalCount} 완료`
      : null;

  return (
    <section
      className="border-gray-3 bg-gray-white overflow-hidden rounded-xl border"
      data-testid="student-agenda-flow-card"
    >
      <header className="border-gray-3 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 md:px-6">
        <div>
          <h2 className="text-gray-12 text-base font-extrabold">오늘 할 일</h2>
          {progressLabel && (
            <p className="text-gray-7 mt-0.5 text-xs font-bold tabular-nums">
              {progressLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="border-gray-4 text-gray-9 hover:border-orange-6 hover:text-orange-9 rounded-lg border px-3 py-2 text-xs font-bold"
            data-testid="student-agenda-add-toggle"
          >
            ＋ 추가
          </button>
          <Link
            href={PRIVATE.DASHBOARD.STUDENT_LOOK_BACK}
            className="border-gray-4 text-gray-9 hover:border-orange-6 hover:text-orange-9 rounded-lg border px-3 py-2 text-xs font-bold"
          >
            돌아보기 ›
          </Link>
        </div>
      </header>
      <div className="p-5 md:p-6">
        <TodayTodoCard
          className="border-0 p-0 shadow-none"
          isAdding={isAdding}
          onAddingChange={setIsAdding}
        />
      </div>
      <p className="border-gray-3 text-gray-7 border-t px-5 py-3 text-xs leading-relaxed md:px-6">
        선생님이 준 일은 지울 수 없어요. 못했으면 이유를 적으면 선생님에게
        그대로 전달됩니다. 지난 주와 지난 달은 돌아보기에서 봅니다.
      </p>
    </section>
  );
};

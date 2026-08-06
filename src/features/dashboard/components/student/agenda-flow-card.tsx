'use client';

import Link from 'next/link';

import { PRIVATE } from '@/shared/constants/route';

import { TodayTodoCard } from './today-todo-card';
import { WeeklyRetroCard } from './weekly-retro-card';

export const AgendaFlowCard = () => (
  <section
    className="border-gray-3 bg-gray-white overflow-hidden rounded-xl border"
    data-testid="student-agenda-flow-card"
  >
    <header className="border-gray-3 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 md:px-6">
      <div>
        <h2 className="text-gray-12 text-base font-extrabold">
          오늘 할 일과 회고
        </h2>
        <p className="text-gray-7 mt-0.5 text-xs">
          할 일을 닫고 오늘을 한 줄로 마무리해요
        </p>
      </div>
      <Link
        href={PRIVATE.DASHBOARD.STUDENT_LOOK_BACK}
        className="border-gray-4 text-gray-9 hover:border-orange-6 hover:text-orange-9 rounded-lg border px-3 py-2 text-xs font-bold"
      >
        돌아보기 ›
      </Link>
    </header>
    <div className="grid md:grid-cols-2">
      <div className="border-gray-3 p-5 md:border-r md:p-6">
        <TodayTodoCard className="border-0 p-0 shadow-none" />
        <div className="border-orange-3 bg-orange-1 text-orange-10 mt-4 rounded-lg border px-3 py-2 text-xs font-bold">
          마지막 · 넷을 다 닫으면 오늘을 한 줄로 닫아요
        </div>
      </div>
      <div className="border-gray-3 border-t p-5 md:border-t-0 md:p-6">
        <div className="mb-3">
          <p className="text-gray-12 text-sm font-extrabold">
            오늘을 한 줄로 닫기
          </p>
          <p className="text-gray-7 text-xs">할 일의 마지막 항목</p>
        </div>
        <WeeklyRetroCard className="border-0 p-0 shadow-none" />
      </div>
    </div>
    <p className="border-gray-3 text-gray-7 border-t px-5 py-3 text-xs leading-relaxed md:px-6">
      선생님이 준 일은 지울 수 없어요. 못했으면 이유를 적으면 선생님에게 그대로
      전달됩니다. 지난 주와 지난 달은 돌아보기에서 봅니다.
    </p>
  </section>
);

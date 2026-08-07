'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useLookBackQuery } from '@/features/dashboard/hooks/use-look-back-query';
import { PRIVATE } from '@/shared/constants';

import StudentDashboardHeader from '../header/student-header';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const LookBackPage = () => {
  const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [offset, setOffset] = useState(0);
  const lookBackQuery = useLookBackQuery(period, offset);
  const records = lookBackQuery.data?.retrospects ?? [];
  const calendar = lookBackQuery.data?.calendar ?? [];
  const coachMessage = lookBackQuery.data?.coachMessage ?? null;

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <StudentDashboardHeader title="돌아보기" />
      <main className="w-full p-4">
        <p className="mb-4 text-xs text-[#747980]">
          내 학습 › <b className="text-[#202226]">돌아보기</b>
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#e3e5e8] bg-white p-2">
          <div className="flex w-60 rounded-md bg-[#f0f1f3] p-1">
            {(['WEEK', 'MONTH'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setPeriod(item);
                  setOffset(0);
                }}
                className={`flex-1 cursor-pointer rounded px-3 py-1.5 text-xs font-bold ${period === item ? 'bg-white shadow-sm' : ''}`}
              >
                {item === 'WEEK' ? '주간' : '월간'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOffset((current) => current + 1)}
            className="min-h-11 cursor-pointer rounded-lg border border-[#e3e5e8] px-3 text-xs font-bold"
          >
            ‹ 지난 {period === 'WEEK' ? '주' : '달'}
          </button>
          <b className="text-sm">
            {offset === 0
              ? `현재 ${period === 'WEEK' ? '주' : '달'} 기록`
              : `${offset}${period === 'WEEK' ? '주' : '달'} 전 기록`}
          </b>
          <button
            type="button"
            disabled={offset === 0}
            onClick={() => setOffset((current) => Math.max(0, current - 1))}
            className="min-h-11 cursor-pointer rounded-lg border border-[#e3e5e8] px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음 {period === 'WEEK' ? '주' : '달'} ›
          </button>
          <button
            type="button"
            onClick={() => setOffset(0)}
            className="ml-auto min-h-11 cursor-pointer rounded-lg border border-[#e3e5e8] px-3 text-xs font-bold"
          >
            오늘로
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <section
              className="rounded-xl border border-[#e3e5e8] bg-white p-5"
              data-testid="coach-message"
            >
              <div className="mb-4 flex items-center gap-2">
                <h2 className="font-extrabold">코치가 보낸 말</h2>
                {coachMessage && (
                  <span className="rounded-full bg-[#fff0e7] px-2 py-1 text-[10px] font-bold text-[#a4481e]">
                    AI가 씀
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff1df]">
                  🦉
                </div>
                <div className="rounded-xl bg-[#f6f7f9] p-4 text-sm leading-6">
                  {coachMessage ??
                    '왔구나. 나는 네가 한 걸 보고 말을 거는 쪽이라, 아직은 해줄 말이 없어. 없는 기록을 지어내서 칭찬하진 않을게.'}
                </div>
              </div>
            </section>
            <section className="rounded-xl border border-[#e3e5e8] bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-extrabold">
                  {period === 'WEEK' ? '이 주 할 일' : '주별 완료'}
                </h2>
                <span className="text-xs text-[#747980]">완료 / 전체</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((day, index) => (
                  <div
                    key={day.date}
                    className="relative min-h-16 rounded-md border border-[#e3e5e8] bg-[#fafafa] p-2 text-center"
                  >
                    <span className="block text-[10px] text-[#747980]">
                      {WEEK_DAYS[index % 7]}
                    </span>
                    <b className="text-sm">{Number(day.date.slice(-2))}</b>
                    <span className="mt-1 block text-[10px]">
                      {day.todoDone} / {day.todoTotal}
                    </span>
                    {day.hasRetrospect && (
                      <i className="absolute right-1.5 bottom-1.5 size-1.5 rounded-full bg-[#f26a2e]" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-[#747980]">
                칸 안 숫자는 완료 / 전체입니다. 오른쪽 아래 점은 그날 회고가
                있다는 뜻입니다.
              </p>
            </section>
          </div>
          <section className="rounded-xl border border-[#e3e5e8] bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-extrabold">
                이 {period === 'WEEK' ? '주' : '달'} 회고 {records.length}건
              </h2>
              <span className="text-xs text-[#747980]">
                내가 쓴 문장 그대로
              </span>
            </div>
            {lookBackQuery.isError ? (
              <p className="rounded-lg bg-[#fff7f4] p-6 text-center text-sm">
                회고를 불러오지 못했어요.
              </p>
            ) : records.length === 0 ? (
              <div className="rounded-lg bg-[#fafafa] p-8 text-center text-sm text-[#747980]">
                <p>
                  아직 돌아볼 기록이 없어요. 빈 날을 채우라고 재촉하지 않습니다.
                </p>
                <Link
                  href={PRIVATE.DASHBOARD.STUDENT}
                  className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#f26a2e] px-4 font-bold text-white"
                >
                  오늘 할 일 적으러 가기
                </Link>
              </div>
            ) : (
              records.map((record) => (
                <article
                  key={record.date}
                  className="border-t border-[#eee] py-4 first:border-t-0"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <b className="text-sm">{record.date}</b>
                    {record.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-[#fff0e7] px-2 py-1 text-[10px] font-bold"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-6">
                    {record.learned ?? '기록 없음'}
                  </p>
                  <p className="mt-2 text-xs text-[#747980]">
                    배운 것 · {record.learned ?? '기록 없음'}
                  </p>
                  <p className="text-xs text-[#747980]">
                    돌아본 것 · {record.reflected ?? '기록 없음'}
                  </p>
                  <p className="text-xs text-[#747980]">
                    내일 할 것 · {record.tomorrow ?? '기록 없음'}
                  </p>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

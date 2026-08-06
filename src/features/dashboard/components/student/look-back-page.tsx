'use client';

import { useState } from 'react';

import { useLookBackQuery } from '@/features/dashboard/hooks/use-look-back-query';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const LookBackPage = () => {
  const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('WEEK');
  const lookBackQuery = useLookBackQuery(period);
  const records = lookBackQuery.data?.retrospects ?? [];
  const calendar = lookBackQuery.data?.calendar ?? [];
  const coachMessage = lookBackQuery.data?.coachMessage ?? null;

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white px-8 py-4">
        <h1 className="text-lg font-extrabold">돌아보기</h1>
      </header>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-6">
        <p className="mb-4 text-xs text-[#747980]">
          내 학습 › <b className="text-[#202226]">돌아보기</b>
        </p>
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-[#e3e5e8] bg-white p-2">
          <div className="flex w-60 rounded-md bg-[#f0f1f3] p-1">
            {(['WEEK', 'MONTH'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`flex-1 rounded px-3 py-1.5 text-xs font-bold ${period === item ? 'bg-white shadow-sm' : ''}`}
              >
                {item === 'WEEK' ? '주간' : '월간'}
              </button>
            ))}
          </div>
          <button className="rounded-md border px-2 py-1 text-xs">
            ‹ 지난 {period === 'WEEK' ? '주' : '달'}
          </button>
          <b className="text-sm">{period === 'WEEK' ? '이번 주' : '이번 달'}</b>
          <button className="rounded-md border px-2 py-1 text-xs">
            다음 {period === 'WEEK' ? '주' : '달'} ›
          </button>
          <button className="ml-auto rounded-md border px-2 py-1 text-xs">
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
              <p className="rounded-lg bg-[#fafafa] p-8 text-center text-sm text-[#747980]">
                아직 돌아볼 기록이 없어요. 빈 날을 채우라고 재촉하지 않습니다.
              </p>
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

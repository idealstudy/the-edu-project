'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useLookBackQuery } from '@/features/dashboard/hooks/use-look-back-query';
import { useUnitNoteLibraryQuery } from '@/features/unit-note/hooks/use-unit-note-query';
import { PRIVATE } from '@/shared/constants';

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** 그 날짜가 속한 주의 월요일 */
const mondayOf = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * 승인 디자인 v22 `sLookMonth` 2513: 월간의 <주별 완료> 행.
 * 서버 월간 응답은 그 달의 날짜 배열을 주므로 주 단위로 접어서 만든다.
 */
const weeklyRollup = (
  calendar: { date: string; todoDone: number; todoTotal: number }[]
) => {
  const buckets = new Map<
    string,
    { label: string; done: number; total: number; monday: Date }
  >();
  calendar.forEach((day) => {
    const monday = mondayOf(day.date);
    const key = monday.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? {
      label: `${monday.getMonth() + 1}월 ${Math.ceil((monday.getDate() + 6) / 7)}주`,
      done: 0,
      total: 0,
      monday,
    };
    bucket.done += day.todoDone;
    bucket.total += day.todoTotal;
    buckets.set(key, bucket);
  });
  return [...buckets.values()];
};

/** 지금 주 기준으로 그 주가 몇 주 전인지. 돌아보기 주간 offset 과 같은 뜻이다. */
const weekOffsetFrom = (monday: Date) => {
  const thisMonday = mondayOf(new Date().toISOString().slice(0, 10));
  return Math.max(
    0,
    Math.round((thisMonday.getTime() - monday.getTime()) / MS_PER_WEEK)
  );
};

export const LookBackPage = () => {
  const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [offset, setOffset] = useState(0);
  // v22 `sLookWeek` 2483 `회고 있는 날만` 필터
  const [onlyWithRetrospect, setOnlyWithRetrospect] = useState(false);
  const lookBackQuery = useLookBackQuery(period, offset);
  const unitNoteQuery = useUnitNoteLibraryQuery();
  const allRecords = lookBackQuery.data?.retrospects ?? [];
  const allCalendar = lookBackQuery.data?.calendar ?? [];
  const coachMessage = lookBackQuery.data?.coachMessage ?? null;

  const hasContent = (record: (typeof allRecords)[number]) =>
    Boolean(record.learned || record.reflected || record.tomorrow);
  const records = onlyWithRetrospect
    ? allRecords.filter(hasContent)
    : allRecords;
  const calendar = onlyWithRetrospect
    ? allCalendar.filter((day) => day.hasRetrospect)
    : allCalendar;

  const weeks = period === 'MONTH' ? weeklyRollup(allCalendar) : [];
  // v22 `sLookMonth` 2528 `이 달 정리한 단원` — 노트가 실제로 있는 단원만
  const touchedUnits = (unitNoteQuery.data?.nodes ?? [])
    .filter((node) => node.pageCount > 0)
    .slice(0, 6);

  const openWeek = (monday: Date) => {
    setPeriod('WEEK');
    setOffset(weekOffsetFrom(monday));
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
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
                {/* v22 `coachMsg` 2456 `다시 받기` — 코치 메시지를 서버에 다시 요청한다. */}
                <button
                  type="button"
                  onClick={() => lookBackQuery.refetch()}
                  disabled={lookBackQuery.isFetching}
                  data-testid="look-back-coach-refresh"
                  className="ml-auto min-h-9 cursor-pointer rounded-lg border border-[#e3e5e8] px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {lookBackQuery.isFetching ? '받는 중' : '다시 받기'}
                </button>
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
                {onlyWithRetrospect &&
                  ' 지금은 회고가 있는 날만 보고 있습니다.'}
              </p>
            </section>

            {/* v22 `sLookMonth` 2513 주별 완료 + `그 주 보기` */}
            {period === 'MONTH' && weeks.length > 0 && (
              <section
                className="rounded-xl border border-[#e3e5e8] bg-white p-5"
                data-testid="look-back-weekly-rollup"
              >
                <h2 className="mb-3 font-extrabold">주별 완료</h2>
                {weeks.map((week) => (
                  <div
                    key={week.monday.toISOString()}
                    className="flex items-center gap-3 border-t border-[#eee] py-3 first:border-t-0"
                  >
                    <b className="min-w-20 text-sm">{week.label}</b>
                    <span className="h-1.5 flex-1 rounded-full bg-[#f0f1f3]">
                      <i
                        className="block h-1.5 rounded-full bg-[#f26a2e]"
                        style={{
                          width: `${week.total === 0 ? 0 : Math.round((week.done / week.total) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="text-xs">
                      {week.done} / {week.total}
                    </span>
                    <button
                      type="button"
                      onClick={() => openWeek(week.monday)}
                      className="min-h-9 cursor-pointer rounded-lg border border-[#e3e5e8] px-3 text-xs font-bold"
                    >
                      그 주 보기
                    </button>
                  </div>
                ))}
              </section>
            )}

            {/* v22 `sLookMonth` 2528 이 달 정리한 단원 + `노트 열기` */}
            {period === 'MONTH' && touchedUnits.length > 0 && (
              <section
                className="rounded-xl border border-[#e3e5e8] bg-white p-5"
                data-testid="look-back-touched-units"
              >
                <h2 className="mb-3 font-extrabold">정리한 단원</h2>
                {touchedUnits.map((node) => (
                  <div
                    key={node.nodeId}
                    className="flex items-center gap-3 border-t border-[#eee] py-3 first:border-t-0"
                  >
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">
                        {node.displayName || node.unit}
                      </b>
                      <small className="text-xs text-[#747980]">
                        노트 {node.pageCount}장
                      </small>
                    </span>
                    <Link
                      href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(node.nodeId)}
                      className="min-h-9 rounded-lg border border-[#e3e5e8] px-3 text-xs leading-9 font-bold"
                    >
                      노트 열기
                    </Link>
                  </div>
                ))}
              </section>
            )}
          </div>
          <section className="rounded-xl border border-[#e3e5e8] bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-extrabold">
                이 {period === 'WEEK' ? '주' : '달'} 회고 {records.length}건
              </h2>
              <span className="text-xs text-[#747980]">
                내가 쓴 문장 그대로
              </span>
              {/* v22 `sLookWeek` 2483 `회고 있는 날만` */}
              <button
                type="button"
                aria-pressed={onlyWithRetrospect}
                onClick={() => setOnlyWithRetrospect((current) => !current)}
                data-testid="look-back-only-retrospect"
                className={`ml-auto min-h-9 cursor-pointer rounded-lg border px-3 text-xs font-bold ${
                  onlyWithRetrospect
                    ? 'border-[#f26a2e] bg-[#fff3ec] text-[#9a441f]'
                    : 'border-[#e3e5e8]'
                }`}
              >
                회고 있는 날만
              </button>
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

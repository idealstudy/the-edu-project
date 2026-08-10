'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useLookBackQuery } from '@/features/dashboard/hooks/use-look-back-query';
import { useUnitNoteLibraryQuery } from '@/features/unit-note/hooks/use-unit-note-query';
import { PageLayout, SplitLayout } from '@/layout';
import { Card } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
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
    <div className="bg-system-background min-h-screen">
      <PageLayout>
        <p className="text-gray-8 mb-4 text-xs">
          내 학습 › <b className="text-gray-12">돌아보기</b>
        </p>
        <div className="border-gray-3 mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-white p-2">
          <div className="bg-gray-2 flex w-60 rounded-md p-1">
            {(['WEEK', 'MONTH'] as const).map((item) => (
              <UnstyledButton
                variant="unstyled"
                size="none"
                key={item}
                type="button"
                onClick={() => {
                  setPeriod(item);
                  setOffset(0);
                }}
                className={`flex-1 cursor-pointer rounded px-3 py-1.5 text-xs font-bold ${period === item ? 'bg-white shadow-sm' : ''}`}
              >
                {item === 'WEEK' ? '주간' : '월간'}
              </UnstyledButton>
            ))}
          </div>
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            onClick={() => setOffset((current) => current + 1)}
            className="border-gray-3 min-h-11 cursor-pointer rounded-lg border px-3 text-xs font-bold"
          >
            ‹ 지난 {period === 'WEEK' ? '주' : '달'}
          </UnstyledButton>
          <b className="text-sm">
            {offset === 0
              ? `현재 ${period === 'WEEK' ? '주' : '달'} 기록`
              : `${offset}${period === 'WEEK' ? '주' : '달'} 전 기록`}
          </b>
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            disabled={offset === 0}
            onClick={() => setOffset((current) => Math.max(0, current - 1))}
            className="border-gray-3 min-h-11 cursor-pointer rounded-lg border px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음 {period === 'WEEK' ? '주' : '달'} ›
          </UnstyledButton>
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            onClick={() => setOffset(0)}
            className="border-gray-3 ml-auto min-h-11 cursor-pointer rounded-lg border px-3 text-xs font-bold"
          >
            오늘로
          </UnstyledButton>
        </div>

        <SplitLayout>
          <div className="space-y-4">
            <Card data-testid="coach-message">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="font-extrabold">코치가 보낸 말</h2>
                {coachMessage && (
                  <span className="bg-orange-1 text-orange-11 text-ui-compact rounded-full px-2 py-1 font-bold">
                    AI가 씀
                  </span>
                )}
                {/* v22 `coachMsg` 2456 `다시 받기` — 코치 메시지를 서버에 다시 요청한다. */}
                <UnstyledButton
                  variant="unstyled"
                  size="none"
                  type="button"
                  onClick={() => lookBackQuery.refetch()}
                  disabled={lookBackQuery.isFetching}
                  data-testid="look-back-coach-refresh"
                  className="border-gray-3 ml-auto min-h-9 cursor-pointer rounded-lg border px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {lookBackQuery.isFetching ? '받는 중' : '다시 받기'}
                </UnstyledButton>
              </div>
              <div className="flex gap-3">
                <div className="bg-orange-2 flex size-10 shrink-0 items-center justify-center rounded-full">
                  🦉
                </div>
                <div className="bg-gray-1 rounded-xl p-4 text-sm leading-6">
                  {coachMessage ??
                    '왔구나. 나는 네가 한 걸 보고 말을 거는 쪽이라, 아직은 해줄 말이 없어. 없는 기록을 지어내서 칭찬하진 않을게.'}
                </div>
              </div>
            </Card>
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-extrabold">
                  {period === 'WEEK' ? '이 주 할 일' : '주별 완료'}
                </h2>
                <span className="text-gray-8 text-xs">완료 / 전체</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendar.map((day, index) => (
                  <div
                    key={day.date}
                    className="border-gray-3 bg-gray-1 relative min-h-16 rounded-md border p-2 text-center"
                  >
                    <span className="text-gray-8 text-ui-compact block">
                      {WEEK_DAYS[index % 7]}
                    </span>
                    <b className="text-sm">{Number(day.date.slice(-2))}</b>
                    <span className="text-ui-compact mt-1 block">
                      {day.todoDone} / {day.todoTotal}
                    </span>
                    {day.hasRetrospect && (
                      <i className="bg-orange-7 absolute right-1.5 bottom-1.5 size-1.5 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-gray-8 text-ui-choice mt-3 leading-5">
                칸 안 숫자는 완료 / 전체입니다. 오른쪽 아래 점은 그날 회고가
                있다는 뜻입니다.
                {onlyWithRetrospect &&
                  ' 지금은 회고가 있는 날만 보고 있습니다.'}
              </p>
            </Card>

            {/* v22 `sLookMonth` 2513 주별 완료 + `그 주 보기` */}
            {period === 'MONTH' && weeks.length > 0 && (
              <Card data-testid="look-back-weekly-rollup">
                <h2 className="mb-3 font-extrabold">주별 완료</h2>
                {weeks.map((week) => (
                  <div
                    key={week.monday.toISOString()}
                    className="border-gray-2 flex items-center gap-3 border-t py-3 first:border-t-0"
                  >
                    <b className="min-w-20 text-sm">{week.label}</b>
                    <span className="bg-gray-2 h-1.5 flex-1 rounded-full">
                      <i
                        className="bg-orange-7 block h-1.5 rounded-full"
                        style={{
                          width: `${week.total === 0 ? 0 : Math.round((week.done / week.total) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="text-xs">
                      {week.done} / {week.total}
                    </span>
                    <UnstyledButton
                      variant="unstyled"
                      size="none"
                      type="button"
                      onClick={() => openWeek(week.monday)}
                      className="border-gray-3 min-h-9 cursor-pointer rounded-lg border px-3 text-xs font-bold"
                    >
                      그 주 보기
                    </UnstyledButton>
                  </div>
                ))}
              </Card>
            )}

            {/* v22 `sLookMonth` 2528 이 달 정리한 단원 + `노트 열기` */}
            {period === 'MONTH' && touchedUnits.length > 0 && (
              <Card data-testid="look-back-touched-units">
                <h2 className="mb-3 font-extrabold">정리한 단원</h2>
                {touchedUnits.map((node) => (
                  <div
                    key={node.nodeId}
                    className="border-gray-2 flex items-center gap-3 border-t py-3 first:border-t-0"
                  >
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">
                        {node.displayName || node.unit}
                      </b>
                      <small className="text-gray-8 text-xs">
                        노트 {node.pageCount}장
                      </small>
                    </span>
                    <Link
                      href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(node.nodeId)}
                      className="border-gray-3 min-h-9 rounded-lg border px-3 text-xs leading-9 font-bold"
                    >
                      노트 열기
                    </Link>
                  </div>
                ))}
              </Card>
            )}
          </div>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-extrabold">
                이 {period === 'WEEK' ? '주' : '달'} 회고 {records.length}건
              </h2>
              <span className="text-gray-8 text-xs">내가 쓴 문장 그대로</span>
              {/* v22 `sLookWeek` 2483 `회고 있는 날만` */}
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                aria-pressed={onlyWithRetrospect}
                onClick={() => setOnlyWithRetrospect((current) => !current)}
                data-testid="look-back-only-retrospect"
                className={`ml-auto min-h-9 cursor-pointer rounded-lg border px-3 text-xs font-bold ${
                  onlyWithRetrospect
                    ? 'border-orange-7 bg-orange-1 text-orange-11'
                    : 'border-gray-3'
                }`}
              >
                회고 있는 날만
              </UnstyledButton>
            </div>
            {lookBackQuery.isError ? (
              <p className="bg-red-1 rounded-lg p-6 text-center text-sm">
                회고를 불러오지 못했어요.
              </p>
            ) : records.length === 0 ? (
              <div className="bg-gray-1 text-gray-8 rounded-lg p-8 text-center text-sm">
                <p>
                  아직 돌아볼 기록이 없어요. 빈 날을 채우라고 재촉하지 않습니다.
                </p>
                <Link
                  href={PRIVATE.DASHBOARD.STUDENT}
                  className="bg-orange-7 mt-4 inline-flex min-h-11 items-center rounded-lg px-4 font-bold text-white"
                >
                  오늘 할 일 적으러 가기
                </Link>
              </div>
            ) : (
              records.map((record) => (
                <article
                  key={record.date}
                  className="border-gray-2 border-t py-4 first:border-t-0"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <b className="text-sm">{record.date}</b>
                    {record.chips.map((chip) => (
                      <span
                        key={chip}
                        className="bg-orange-1 text-ui-compact rounded-full px-2 py-1 font-bold"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm leading-6">
                    {record.learned ?? '기록 없음'}
                  </p>
                  <p className="text-gray-8 mt-2 text-xs">
                    배운 것 · {record.learned ?? '기록 없음'}
                  </p>
                  <p className="text-gray-8 text-xs">
                    돌아본 것 · {record.reflected ?? '기록 없음'}
                  </p>
                  <p className="text-gray-8 text-xs">
                    내일 할 것 · {record.tomorrow ?? '기록 없음'}
                  </p>
                </article>
              ))
            )}
          </Card>
        </SplitLayout>
      </PageLayout>
    </div>
  );
};

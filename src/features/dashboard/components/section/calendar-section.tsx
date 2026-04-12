'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { TimerModal } from '../timer';

/* ------------------------------------------------------------------ */
/* Types & helpers                                                      */
/* ------------------------------------------------------------------ */

type StudyRecord = { seconds: number; noteTitle?: string; subject?: string };
type StudyData = Record<number, StudyRecord>;

const formatHHMMSS = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const formatStudyTime = (seconds: number) => {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  if (hr > 0) return min > 0 ? `${hr}시간 ${min}분` : `${hr}시간`;
  return sec > 0 ? `${min}분 ${sec}초` : `${min}분`;
};

const getBadge = (
  seconds: number
): { label: string; className: string } | null => {
  if (seconds <= 0) return null;
  if (seconds >= 25200)
    return {
      label: formatStudyTime(seconds),
      className: 'bg-orange-7 text-white',
    };
  if (seconds >= 10800)
    return {
      label: formatStudyTime(seconds),
      className: 'bg-orange-6 text-white',
    };
  if (seconds >= 3600)
    return {
      label: formatStudyTime(seconds),
      className: 'bg-orange-5 text-white',
    };
  return {
    label: formatStudyTime(seconds),
    className: 'bg-orange-4 text-orange-12',
  };
};

/* ------------------------------------------------------------------ */
/* MonthCalendar                                                        */
/* ------------------------------------------------------------------ */

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const MonthCalendar = ({
  year,
  month,
  studyData = {},
}: {
  year: number;
  month: number;
  studyData?: StudyData;
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const firstDayRaw = new Date(year, month - 1, 1).getDay();
  const startOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const cells: Array<{ day: number; current: boolean }> = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const tail = cells.length % 7;
  if (tail !== 0) {
    for (let d = 1; d <= 7 - tail; d++) {
      cells.push({ day: d, current: false });
    }
  }

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const selectedRecord =
    selectedDay !== null ? studyData[selectedDay] : undefined;

  return (
    <>
      <div className="w-full overflow-hidden rounded-md">
        <div className="grid grid-cols-7">
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="bg-gray-1 border-gray-2 font-label-heading text-gray-7 border-[0.5px] px-3 py-[10.5px]"
            >
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7"
          >
            {week.map((cell, di) => {
              const record = cell.current ? studyData[cell.day] : undefined;
              const badge = record ? getBadge(record.seconds) : null;
              const hasRecord = cell.current && !!record;
              return (
                <div
                  key={di}
                  onClick={() => hasRecord && setSelectedDay(cell.day)}
                  className={cn(
                    'border-gray-2 hover:border-orange-6 hover:bg-orange-1 flex min-h-[100px] flex-col justify-between gap-1.5 border-[0.5px] p-3 transition-colors',
                    hasRecord ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'font-body2-heading',
                      cell.current ? 'text-text-main' : 'text-text-disabled'
                    )}
                  >
                    {cell.day}
                  </span>
                  {badge && (
                    <span
                      className={cn(
                        'font-label-normal w-fit rounded-[6px] px-1.5 py-[3px]',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog
        isOpen={selectedDay !== null && !deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
      >
        <Dialog.Content className="tablet:max-w-125 gap-6">
          <Dialog.Close className="absolute top-6 right-6 cursor-pointer">
            <X size={20} />
          </Dialog.Close>
          <p className="font-headline1-heading text-center">
            {formatHHMMSS(selectedRecord?.seconds ?? 0)} 공부 완료
          </p>
          <div className="bg-gray-1 flex flex-col rounded-md px-4 py-3">
            <span className="font-body2-normal text-text-main pb-3">
              {selectedRecord?.noteTitle ?? '-'}
            </span>
            <div className="bg-line-line2 h-px w-full" />
            <span className="font-body2-normal text-text-sub pt-3">
              {selectedRecord?.subject ?? '-'}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              학습 내용 삭제하기
            </Button>
            <Button className="flex-1">학습노트 가기</Button>
          </div>
        </Dialog.Content>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmOpen(false);
        }}
      >
        <Dialog.Content className="tablet:max-w-125 gap-6">
          <Dialog.Close className="absolute top-6 right-6 cursor-pointer">
            <X size={20} />
          </Dialog.Close>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-orange-2 flex size-12 items-center justify-center rounded-full">
              <span className="text-orange-9 font-headline1-heading">!</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-headline2-heading text-text-main">
                학습 기록을 삭제하시겠습니까?
              </p>
              <p className="font-body2-normal text-text-sub">
                학습 기록을 삭제하면 기록한 시간도 삭제됩니다.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedDay(null);
              }}
            >
              확인
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* CalendarSection                                                      */
/* ------------------------------------------------------------------ */

const CalendarSection = () => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const minYear = 2025;
  const [selectedYear, setSelectedYear] = useState(todayYear);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'month' | 'year'>('month');
  const [yearRangeStart, setYearRangeStart] = useState(minYear);
  const [hour] = useState(1);
  const [timerOpen, setTimerOpen] = useState(false);

  const years = Array.from({ length: 9 }, (_, i) => yearRangeStart + i);

  const navButtonClass =
    'rounded p-1 hover:bg-gray-scale-gray-1 disabled:cursor-not-allowed disabled:opacity-30';
  const cellButtonClass = (isSelected: boolean, isDisabled: boolean) =>
    cn(
      'rounded-lg py-2 text-center text-sm',
      isSelected
        ? 'bg-key-color-primary text-white'
        : 'text-text-main hover:bg-gray-scale-gray-1',
      isDisabled && 'cursor-not-allowed opacity-30 hover:bg-transparent'
    );

  return (
    <div className="flex flex-col gap-6">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setView('month');
        }}
      >
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2">
            <p className="font-headline1-heading text-gray-12">
              {selectedYear}년 {selectedMonth}월
            </p>
            <button type="button">
              <ChevronDown size={24} />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-60 p-3"
          align="start"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              disabled={
                view === 'month'
                  ? selectedYear <= minYear
                  : yearRangeStart <= minYear
              }
              className={navButtonClass}
              onClick={() =>
                view === 'month'
                  ? setSelectedYear((y) => y - 1)
                  : setYearRangeStart((y) => y - 9)
              }
            >
              <ChevronLeft size={16} />
            </button>
            {view === 'month' ? (
              <button
                type="button"
                className="hover:bg-gray-scale-gray-1 rounded px-2 py-1 text-sm font-semibold"
                onClick={() => setView('year')}
              >
                {selectedYear}년
              </button>
            ) : (
              <span className="text-sm font-semibold">
                {yearRangeStart} - {yearRangeStart + 8}
              </span>
            )}
            <button
              type="button"
              disabled={
                view === 'month'
                  ? selectedYear >= todayYear
                  : yearRangeStart + 9 > todayYear
              }
              className={navButtonClass}
              onClick={() =>
                view === 'month'
                  ? setSelectedYear((y) => y + 1)
                  : setYearRangeStart((y) => y + 9)
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {view === 'month' ? (
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, i) => `${i + 1}월`).map(
                (m, i) => {
                  const isDisabled =
                    selectedYear > todayYear ||
                    (selectedYear === todayYear && i + 1 > todayMonth);
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        setSelectedMonth(i + 1);
                        setIsOpen(false);
                      }}
                      className={cellButtonClass(
                        selectedMonth === i + 1,
                        isDisabled
                      )}
                    >
                      {m}
                    </button>
                  );
                }
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {years.map((y) => {
                const isDisabled = y > todayYear || y < minYear;
                return (
                  <button
                    key={y}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedYear(y);
                      setView('month');
                    }}
                    className={cellButtonClass(selectedYear === y, isDisabled)}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <div className="flex flex-col gap-3">
        <div className="bg-orange-1 text-gray-12 flex justify-between rounded-md px-3 py-[9px]">
          <div className="flex items-center gap-1">
            <Image
              src="/dashboard/img_clock.png"
              alt="clock"
              width={36}
              height={36}
              className="mix-blend-multiply"
            />
            {hour ? (
              <p>{selectedMonth}월의 공부, 지금 시작해보세요!</p>
            ) : (
              <p>
                {selectedMonth}월은 총 {hour}시간 공부했어요!
              </p>
            )}
          </div>
          <Button
            className="font-label-heading h-auto rounded-sm px-6 py-2"
            onClick={() => setTimerOpen(true)}
          >
            타이머 켜기
          </Button>
          <TimerModal
            isOpen={timerOpen}
            onClose={() => setTimerOpen(false)}
          />
        </div>
        <MonthCalendar
          year={selectedYear}
          month={selectedMonth}
          studyData={{
            3: { seconds: 1815, noteTitle: '영어 단어 암기', subject: '영어' },
            8: {
              seconds: 27150,
              noteTitle: '수학노트 오답하기',
              subject: '수학',
            },
            10: {
              seconds: 18440,
              noteTitle: '과학 실험 정리',
              subject: '과학',
            },
            12: { seconds: 7200, noteTitle: '국어 문학 분석', subject: '국어' },
          }}
        />
      </div>
    </div>
  );
};

export default CalendarSection;

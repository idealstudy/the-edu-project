'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { RetrospectMood } from '@/entities/retrospect';
import { Skeleton } from '@/shared/components/loading';
import {
  Button,
  Textarea,
  Toggle,
  showBottomToast,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyRetrospectError } from '@/shared/lib/errors/errors';
import { BatteryLow, Bot, CircleGauge, Flame, RefreshCw } from 'lucide-react';

import {
  useSaveRetrospect,
  useTodayRetrospectQuery,
  useWeeklyRetrospectQuery,
} from '../../hooks/use-retrospect-query';

type Props = {
  className?: string;
};

const MOOD_OPTIONS = [
  { value: 'TIRED', label: '힘들었어요', icon: BatteryLow },
  { value: 'OKAY', label: '할 만했어요', icon: CircleGauge },
  { value: 'FOCUSED', label: '집중했어요', icon: Flame },
] as const;

const MOOD_LABEL: Record<RetrospectMood, string> = {
  TIRED: '힘들었어요',
  OKAY: '할 만했어요',
  FOCUSED: '집중했어요',
};

const formatMonthDay = (date: string) => {
  const [, month = '', day = ''] = date.split('-');
  return `${Number(month)}/${Number(day)}`;
};

const WeeklyRetroLoading = ({ className }: Props) => (
  <section
    className={cn(
      'bg-gray-white border-gray-4 flex flex-col gap-3 rounded-2xl border p-6',
      className
    )}
    data-testid="student-retrospect-loading"
  >
    <Skeleton.Block className="h-6 w-32" />
    <Skeleton.Block className="h-28 w-full" />
    <Skeleton.Block className="h-24 w-full" />
  </section>
);

export const WeeklyRetroCard = ({ className }: Props) => {
  const todayQuery = useTodayRetrospectQuery();
  const weeklyQuery = useWeeklyRetrospectQuery();
  const saveRetrospect = useSaveRetrospect();
  const [isQuickMode, setIsQuickMode] = useState(true);
  const [mood, setMood] = useState<RetrospectMood | null>(null);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [initializedRetrospectId, setInitializedRetrospectId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const todayRetrospect = todayQuery.data?.retrospect;
    if (!todayRetrospect || initializedRetrospectId === todayRetrospect.id) {
      return;
    }

    setMood(todayRetrospect.mood);
    setContent(todayRetrospect.content ?? '');
    setInitializedRetrospectId(todayRetrospect.id);
  }, [initializedRetrospectId, todayQuery.data?.retrospect]);

  if (todayQuery.isPending || weeklyQuery.isPending) {
    return <WeeklyRetroLoading className={className} />;
  }

  if (todayQuery.isError || weeklyQuery.isError) {
    return (
      <section
        className={cn(
          'bg-gray-white border-gray-4 flex flex-col items-center rounded-2xl border px-6 py-10 text-center',
          className
        )}
        data-testid="student-retrospect-error"
      >
        <RefreshCw
          size={30}
          className="text-gray-6"
          aria-hidden
        />
        <h3 className="font-body1-heading text-gray-12 mt-3">
          회고를 불러오지 못했어요
        </h3>
        <p className="font-body2-normal text-gray-8 mt-1">
          잠시 후 다시 시도해주세요.
        </p>
        <Button
          size="small"
          variant="outlined"
          className="mt-5"
          onClick={() => {
            void todayQuery.refetch();
            void weeklyQuery.refetch();
          }}
        >
          다시 불러오기
        </Button>
      </section>
    );
  }

  const today = todayQuery.data;
  const weekly = weeklyQuery.data;
  const handleSaveError = (error: unknown) => {
    handleApiError(error, classifyRetrospectError, {
      onField: setFormError,
      onContext: setFormError,
      onUnknown: setFormError,
    });
  };
  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!mood && !trimmedContent) {
      setFormError('오늘 컨디션을 고르거나 한 줄 회고를 남겨주세요.');
      return;
    }

    setFormError(null);
    saveRetrospect.mutate(
      {
        written: today.written,
        input: {
          mood,
          content: trimmedContent || null,
        },
      },
      {
        onSuccess: () => {
          showBottomToast(
            today.written
              ? '오늘 회고를 수정했어요.'
              : '오늘 회고를 기록했어요.'
          );
        },
        onError: handleSaveError,
      }
    );
  };

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
      aria-labelledby="student-retrospect-title"
      data-testid="student-retrospect-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="student-retrospect-title"
            className="font-body1-heading text-gray-12"
          >
            오늘 회고
          </h3>
          <p className="font-caption-normal text-gray-8 mt-1">
            {formatMonthDay(today.date)} · 기록하면 온도나무가 회복돼요
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <span className="font-caption-heading text-gray-9">30초 회고</span>
          <Toggle
            checked={isQuickMode}
            onCheckedChange={setIsQuickMode}
            aria-label="30초 회고 모드"
            data-testid="student-retrospect-quick-toggle"
          />
        </label>
      </div>

      <form
        className="border-orange-3 bg-orange-1 mt-4 rounded-xl border p-4"
        onSubmit={handleSave}
        data-testid="student-retrospect-form"
      >
        <div>
          <p className="font-caption-heading text-orange-10">
            오늘 컨디션 · 하나만 골라도 저장돼요
          </p>
          <div className="tablet:flex-row mt-3 flex flex-col gap-2">
            {MOOD_OPTIONS.map((option) => {
              const MoodIcon = option.icon;
              const isSelected = mood === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'font-caption-heading flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 py-2.5',
                    isSelected
                      ? 'border-orange-7 bg-gray-white text-orange-10'
                      : 'border-orange-3 bg-gray-white text-gray-9 hover:border-orange-7'
                  )}
                  aria-pressed={isSelected}
                  onClick={() => setMood(option.value)}
                  data-testid={`student-retrospect-mood-${option.value.toLowerCase()}`}
                >
                  <MoodIcon
                    size={16}
                    aria-hidden
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {!isQuickMode && (
          <div className="mt-4">
            <label
              htmlFor="student-retrospect-content"
              className="font-caption-heading text-orange-10"
            >
              한 줄 회고 · 선택
            </label>
            <Textarea
              id="student-retrospect-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={1000}
              rows={3}
              className="border-orange-3 mt-2 bg-white px-3 py-3"
              placeholder="예: 등비수열 합 공식은 내일 유도 과정을 다시 써보기"
              data-testid="student-retrospect-content"
            />
          </div>
        )}

        {isQuickMode && content && (
          <button
            type="button"
            className="font-caption-normal text-gray-8 hover:text-orange-10 mt-3 cursor-pointer text-left underline underline-offset-2"
            onClick={() => setIsQuickMode(false)}
          >
            저장된 한 줄 회고가 있어요 · 열어서 수정하기
          </button>
        )}

        {formError && (
          <p
            className="text-system-warning font-caption-normal mt-3"
            role="alert"
            data-testid="student-retrospect-form-error"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          size="small"
          className="mt-4 w-full"
          disabled={saveRetrospect.isPending}
          data-testid="student-retrospect-save"
        >
          {today.written ? '오늘 회고 수정하기' : '저장하고 나무 데우기'}
        </Button>
        <p className="font-caption-normal text-gray-8 mt-3 text-center">
          이 회고는 나와 선생님이 봐요 · 부모님께는 공유되지 않아요.
        </p>
      </form>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-body1-heading text-gray-12">주간 회고</h4>
          <p className="font-caption-normal text-gray-8 mt-1">
            {formatMonthDay(weekly.weekOf)}–{formatMonthDay(weekly.weekEnd)} ·{' '}
            {weekly.writtenDays}/7일 기록
          </p>
        </div>
        <span className="bg-gray-1 text-gray-9 font-caption-heading rounded-full px-3 py-1.5">
          {weekly.aiSummaryStatus === 'READY' ? 'AI 요약 완료' : '기록 수집 중'}
        </span>
      </div>

      {weekly.aiSummary ? (
        <div className="bg-orange-1 border-orange-3 mt-3 rounded-xl border p-4">
          <div className="text-orange-10 flex items-center gap-2">
            <Bot
              size={17}
              aria-hidden
            />
            <p className="font-caption-heading">AI 조교가 먼저 정리했어요</p>
          </div>
          <p className="font-body2-normal text-gray-11 mt-2 leading-relaxed">
            {weekly.aiSummary}
          </p>
          {weekly.evidenceTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {weekly.evidenceTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-white border-orange-3 text-orange-9 font-caption-heading rounded-md border px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className="border-gray-2 bg-gray-1 mt-3 flex items-center gap-3 rounded-xl border p-4"
          data-testid="student-weekly-retrospect-summary-pending"
        >
          <Bot
            size={22}
            className="text-gray-6 shrink-0"
            aria-hidden
          />
          <div>
            <p className="font-body2-heading text-gray-10">
              AI 주간 요약을 준비하고 있어요
            </p>
            <p className="font-caption-normal text-gray-8 mt-1">
              이번 주 회고 {weekly.writtenDays}일치가 쌓였어요.
            </p>
          </div>
        </div>
      )}

      {weekly.retrospects.length === 0 ? (
        <div
          className="border-gray-2 mt-3 rounded-xl border border-dashed py-7 text-center"
          data-testid="student-weekly-retrospect-empty"
        >
          <p className="font-body2-heading text-gray-9">
            이번 주 회고가 아직 없어요
          </p>
          <p className="font-caption-normal text-gray-7 mt-1">
            위에서 오늘의 첫 기록을 남겨보세요.
          </p>
        </div>
      ) : (
        <ul
          className="mt-3 flex flex-col"
          data-testid="student-weekly-retrospect-list"
        >
          {weekly.retrospects.map((retrospect) => (
            <li
              key={retrospect.id}
              className="border-gray-2 tablet:flex-row tablet:items-start tablet:gap-4 flex flex-col gap-1 border-b py-3 last:border-b-0"
            >
              <span className="font-caption-heading text-gray-8 w-10 shrink-0">
                {formatMonthDay(retrospect.reflectDate)}
              </span>
              <span className="font-caption-heading text-orange-10 tablet:w-20 tablet:shrink-0">
                {retrospect.mood ? MOOD_LABEL[retrospect.mood] : '한 줄 기록'}
              </span>
              <p className="font-body2-normal text-gray-10 min-w-0 flex-1 break-words">
                {retrospect.content ?? '컨디션만 기록했어요.'}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="font-caption-normal text-gray-7 mt-3 leading-relaxed">
        주간 요약과 매일 회고는 선생님이 상담·수업 준비에 봐요. 부모님께는
        전달되지 않아요.
      </p>
    </section>
  );
};

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
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyRetrospectError } from '@/shared/lib/errors/errors';
import {
  BatteryLow,
  Bot,
  CalendarCheck,
  CalendarX,
  CircleGauge,
  Flame,
  RefreshCw,
  Wind,
} from 'lucide-react';

import {
  useSaveRetrospect,
  useTodayRetrospectQuery,
  useWeeklyRetrospectQuery,
} from '../../hooks/use-retrospect-query';

type Props = {
  className?: string;
};

/**
 * 시안 v23 `.chips`(HTML:636): 회고 컨디션 칩 5개 `집중 잘됨/보통/산만함/계획대로/밀림`.
 * 백엔드 계약(retrospect.dto.ts `mood = z.enum(['TIRED','OKAY','FOCUSED'])`)은 3종뿐이라
 * 저장 시 5라벨 → 3enum으로 매핑한다(⛔ 계약 영향: 산만함·밀림이 같은 TIRED로, 집중
 * 잘됨·계획대로가 같은 FOCUSED로 저장돼 서버 조회 시 라벨이 완전히 복원되진 않는다).
 * 화면에는 선택한 라벨 자체를 별도로 기억해 5칩 중 정확히 하나만 켜진 것처럼 보인다.
 */
const MOOD_CHIP_OPTIONS = [
  { key: 'FOCUSED_WELL', label: '집중 잘됨', icon: Flame, mood: 'FOCUSED' },
  { key: 'OKAY', label: '보통', icon: CircleGauge, mood: 'OKAY' },
  { key: 'DISTRACTED', label: '산만함', icon: Wind, mood: 'TIRED' },
  {
    key: 'ON_PLAN',
    label: '계획대로',
    icon: CalendarCheck,
    mood: 'FOCUSED',
  },
  { key: 'BEHIND', label: '밀림', icon: CalendarX, mood: 'TIRED' },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  icon: typeof BatteryLow;
  mood: RetrospectMood;
}>;

type MoodChipKey = (typeof MOOD_CHIP_OPTIONS)[number]['key'];

const MOOD_LABEL: Record<RetrospectMood, string> = {
  TIRED: '힘들었어요',
  OKAY: '할 만했어요',
  FOCUSED: '집중했어요',
};

/** 서버에서 불러온 mood → 화면에 보일 기본 칩(첫 매치)으로 되돌린다. */
const moodToChipKey = (mood: RetrospectMood | null): MoodChipKey | null =>
  MOOD_CHIP_OPTIONS.find((option) => option.mood === mood)?.key ?? null;

/**
 * 시안 v23 `.fld`(HTML:637-638): `배운 것`/`아쉬운 것` 2필드.
 * 저장 스키마(retrospect payload `content`)는 단일 문자열이라, 두 필드를 구분자로
 * 이어 붙여 저장하고 불러올 때 같은 구분자로 되돌린다(⛔ 계약 영향: 구분자를 학생이
 * 직접 입력하면 필드가 잘못 나뉜다. 표시 전용 파싱이라 저장은 항상 안전).
 */
const RETRO_FIELD_DELIMITER = '\n---아쉬운 것---\n';

const splitRetroContent = (
  content: string | null
): { learned: string; regret: string } => {
  if (!content) return { learned: '', regret: '' };
  const [learned = '', regret = ''] = content.split(RETRO_FIELD_DELIMITER);
  return { learned, regret };
};

const joinRetroContent = (learned: string, regret: string): string => {
  const trimmedLearned = learned.trim();
  const trimmedRegret = regret.trim();
  if (!trimmedLearned && !trimmedRegret) return '';
  return `${trimmedLearned}${RETRO_FIELD_DELIMITER}${trimmedRegret}`;
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
  const [moodChipKey, setMoodChipKey] = useState<MoodChipKey | null>(null);
  const [learnedContent, setLearnedContent] = useState('');
  const [regretContent, setRegretContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [initializedRetrospectId, setInitializedRetrospectId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const todayRetrospect = todayQuery.data?.retrospect;
    if (!todayRetrospect || initializedRetrospectId === todayRetrospect.id) {
      return;
    }

    setMoodChipKey(moodToChipKey(todayRetrospect.mood));
    const { learned, regret } = splitRetroContent(
      todayRetrospect.content ?? null
    );
    setLearnedContent(learned);
    setRegretContent(regret);
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
    const mood =
      MOOD_CHIP_OPTIONS.find((option) => option.key === moodChipKey)?.mood ??
      null;
    const joinedContent = joinRetroContent(learnedContent, regretContent);
    if (!mood && !joinedContent) {
      setFormError('오늘 컨디션을 고르거나 한 줄 회고를 남겨주세요.');
      return;
    }

    setFormError(null);
    saveRetrospect.mutate(
      {
        written: today.written,
        input: {
          mood,
          content: joinedContent || null,
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
            {formatMonthDay(today.date)} · 한 줄이면 충분해요
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
          <div className="tablet:flex-row mt-3 flex flex-col flex-wrap gap-2">
            {MOOD_CHIP_OPTIONS.map((option) => {
              const MoodIcon = option.icon;
              const isSelected = moodChipKey === option.key;

              return (
                <UnstyledButton
                  variant="unstyled"
                  size="none"
                  key={option.key}
                  type="button"
                  className={cn(
                    'font-caption-heading flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 py-2.5',
                    isSelected
                      ? 'border-orange-7 bg-gray-white text-orange-10'
                      : 'border-orange-3 bg-gray-white text-gray-9 hover:border-orange-7'
                  )}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setMoodChipKey(isSelected ? null : option.key)
                  }
                  data-testid={`student-retrospect-mood-${option.key.toLowerCase()}`}
                >
                  <MoodIcon
                    size={16}
                    aria-hidden
                  />
                  {option.label}
                </UnstyledButton>
              );
            })}
          </div>
        </div>

        {!isQuickMode && (
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label
                htmlFor="student-retrospect-learned"
                className="font-caption-heading text-orange-10"
              >
                배운 것
              </label>
              <Textarea
                id="student-retrospect-learned"
                value={learnedContent}
                onChange={(event) => setLearnedContent(event.target.value)}
                maxLength={500}
                rows={2}
                className="border-orange-3 mt-2 bg-white px-3 py-3"
                placeholder="예: 등비수열 합 공식에서 항의 개수를 잘못 세는 게 문제였다"
                data-testid="student-retrospect-learned"
              />
            </div>
            <div>
              <label
                htmlFor="student-retrospect-regret"
                className="font-caption-heading text-orange-10"
              >
                아쉬운 것
              </label>
              <Textarea
                id="student-retrospect-regret"
                value={regretContent}
                onChange={(event) => setRegretContent(event.target.value)}
                maxLength={500}
                rows={2}
                className="border-orange-3 mt-2 bg-white px-3 py-3"
                placeholder="예: 18번은 또 틀렸다"
                data-testid="student-retrospect-regret"
              />
            </div>
          </div>
        )}

        {isQuickMode && (learnedContent || regretContent) && (
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            className="font-caption-normal text-gray-8 hover:text-orange-10 mt-3 cursor-pointer text-left underline underline-offset-2"
            onClick={() => setIsQuickMode(false)}
          >
            저장된 회고가 있어요 · 열어서 수정하기
          </UnstyledButton>
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
          {today.written ? '오늘 회고 수정하기' : '오늘 회고 저장하기'}
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
          {weekly.retrospects.map((retrospect) => {
            const { learned, regret } = splitRetroContent(
              retrospect.content ?? null
            );
            return (
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
                  {learned || regret
                    ? [learned, regret].filter(Boolean).join(' · ')
                    : '컨디션만 기록했어요.'}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <p className="font-caption-normal text-gray-7 mt-3 leading-relaxed">
        주간 요약과 매일 회고는 선생님이 상담·수업 준비에 봐요. 부모님께는
        전달되지 않아요.
      </p>
    </section>
  );
};

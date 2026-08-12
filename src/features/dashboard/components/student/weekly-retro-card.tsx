'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { RetrospectMood } from '@/entities/retrospect';
import { Skeleton } from '@/shared/components/loading';
import { Button, Textarea, showBottomToast } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyRetrospectError } from '@/shared/lib/errors/errors';
import {
  BatteryLow,
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
  const saveRetrospect = useSaveRetrospect();
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

  if (todayQuery.isPending) {
    return <WeeklyRetroLoading className={className} />;
  }

  if (todayQuery.isError) {
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
          }}
        >
          다시 불러오기
        </Button>
      </section>
    );
  }

  const today = todayQuery.data;
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
    </section>
  );
};

import { Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────
 * LevelBadge — 레벨(성장 지표) 표시 컴포넌트 (presentational)
 *
 *  레벨은 "꾸준히 성장한 흔적"을 보여 주는 축으로,
 *  소모 화폐인 포인트와는 **다른 축**이다.
 *  (포인트를 써도 레벨은 내려가지 않는다.)
 *
 *  실제 값은 GET /api/common/me/level (UserLevelResponse)에서 온다.
 *  데이터 fetch는 features/level 의 connected 래퍼가 담당하고,
 *  이 컴포넌트는 받은 값을 형태(Lv.N + 경험치 게이지)로만 그린다.
 * ────────────────────────────────────────────────────*/
type LevelBadgeProps = {
  /** 현재 레벨 */
  level?: number;
  /** 현재 레벨 내 진행률(0~100) — API progressPercent */
  progressPercent?: number;
  /** 다음 레벨까지 남은 경험치 — API expToNextLevel */
  expToNextLevel?: number;
  /** 로딩 상태(게이지·숫자를 placeholder로) */
  isLoading?: boolean;
  /** 조회 실패 시 실제 값처럼 보이는 기본 레벨을 만들지 않는다. */
  isError?: boolean;
};

export const LevelBadge = ({
  level = 1,
  progressPercent = 0,
  expToNextLevel = 0,
  isLoading = false,
  isError = false,
}: LevelBadgeProps) => {
  const ratio = Math.min(100, Math.max(0, Math.round(progressPercent)));

  return (
    <section
      className="border-line-line1 rounded-card flex h-full flex-col gap-4 border bg-white p-5"
      aria-label="레벨"
    >
      <div className="flex items-center gap-3">
        <div className="bg-orange-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <Sparkles
            size={22}
            className="text-orange-7"
            aria-hidden
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-caption-heading text-text-sub2">
            레벨 · 성장 지표
          </span>
          <span className="font-body1-heading text-text-main tabular-nums">
            {isLoading ? 'Lv.-' : isError ? '집계 없음' : `Lv.${level}`}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <progress
          value={isLoading || isError ? 0 : ratio}
          max={100}
          aria-label={
            isError ? '레벨 진행률 집계 없음' : `레벨 진행률 ${ratio}%`
          }
          className="accent-orange-7 bg-gray-1 rounded-pill h-2 w-full overflow-hidden"
        />
        <div className="flex items-center justify-between">
          <span className="font-caption-normal text-text-sub2">
            다음 레벨까지
          </span>
          <span className="font-caption-heading text-text-sub1 tabular-nums">
            {isLoading || isError
              ? '- XP'
              : `${expToNextLevel.toLocaleString('ko-KR')} XP`}
          </span>
        </div>
      </div>

      <p className="font-caption-normal text-text-sub2 leading-relaxed">
        레벨은 꾸준히 성장한 흔적이에요. 포인트를 써도 레벨은 내려가지 않아요.
      </p>
    </section>
  );
};

import { Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────
 * LevelBadge — 레벨(성장 지표) 자리표시 컴포넌트
 *
 *  레벨은 "꾸준히 성장한 흔적"을 보여 주는 축으로,
 *  소모 화폐인 포인트와는 **다른 축**이다.
 *  (포인트를 써도 레벨은 내려가지 않는다.)
 *
 *  실제 레벨/경험치 API가 아직 없어 정적 placeholder로 둔다.
 *  - 형태(Lv.N + 경험치 게이지)로 포인트 잔액 카드와 시각적으로 구분.
 *  - 백엔드 연동 시 props로 level/exp/nextExp를 받도록 확장.
 * ────────────────────────────────────────────────────*/
type LevelBadgeProps = {
  /** 현재 레벨 (API 연동 전 정적 기본값) */
  level?: number;
  /** 현재 레벨 내 누적 경험치 */
  exp?: number;
  /** 다음 레벨까지 필요한 경험치 */
  nextExp?: number;
};

export const LevelBadge = ({
  level = 1,
  exp = 0,
  nextExp = 100,
}: LevelBadgeProps) => {
  const ratio =
    nextExp > 0 ? Math.min(100, Math.round((exp / nextExp) * 100)) : 0;

  return (
    <section
      className="border-line-line1 flex flex-col gap-4 rounded-[12px] border bg-white p-5"
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
            Lv.{level}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="bg-gray-1 h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-orange-7 h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${ratio}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-caption-normal text-text-sub2">
            다음 레벨까지
          </span>
          <span className="font-caption-heading text-text-sub1 tabular-nums">
            {exp} / {nextExp} XP
          </span>
        </div>
      </div>

      <p className="font-caption-normal text-text-sub2 leading-relaxed">
        레벨은 꾸준히 성장한 흔적이에요. 포인트를 써도 레벨은 내려가지 않아요.
      </p>
    </section>
  );
};

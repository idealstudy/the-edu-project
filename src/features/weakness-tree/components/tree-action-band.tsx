import { Button } from '@/shared/components/ui';

import { type RidgeNode } from '../lib/ridge';

type TreeActionBandProps = {
  valley: RidgeNode | null;
  onAction: (node: RidgeNode) => void;
};

/* ─────────────────────────────────────────────────────
 * 단일 액션 밴드 — v4 .action 이식.
 *  흩어진 "메우기" 버튼들을 여기 하나로 일원화하고,
 *  개별 메우기는 봉우리 드릴다운 진입 후에만 노출한다.
 * ────────────────────────────────────────────────────*/
export const TreeActionBand = ({ valley, onAction }: TreeActionBandProps) => {
  if (!valley) return null;

  return (
    <div className="bg-orange-1 border-orange-3 rounded-card flex flex-col items-stretch gap-3.5 border px-5 py-4.5 sm:flex-row sm:items-center">
      <p className="text-orange-12 text-coach flex-1 leading-[1.5] font-semibold">
        <span className="text-system-warning mr-1 font-bold">⚠</span>
        가장 깊은 협곡은{' '}
        <b className="text-key-color-primary">{valley.displayName}</b> · 자력{' '}
        <b className="text-key-color-primary tabular-nums">
          {valley.masteryScore}%
        </b>
        . 여기부터 메우면 능선이 이어진다.
      </p>
      {/* v22 §3.3 큰 버튼 `.bigcta`: 그림자 0 4px 0 orange-10 */}
      <Button
        size="small"
        onClick={() => onAction(valley)}
        className="shrink-0 shadow-[0_4px_0_var(--orange-10)] active:translate-y-0.5 active:shadow-[0_1px_0_var(--orange-10)]"
      >
        가장 약한 곳부터 메우기
      </Button>
    </div>
  );
};

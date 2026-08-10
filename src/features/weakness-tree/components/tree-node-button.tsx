import { type TreeIntensity, type TreeNodeView } from '@/entities/tree';
import { cn } from '@/shared/lib';
import { AlertTriangle } from 'lucide-react';

/* ─────────────────────────────────────────────────────
 * 강도 → 배경/텍스트 대비 매핑
 *  진한 단계(progress·mastered)는 흰 글씨, 옅은 단계는 짙은 글씨.
 * ────────────────────────────────────────────────────*/
const INTENSITY_STYLE: Record<
  TreeIntensity,
  { fill: string; text: string; sub: string }
> = {
  untested: {
    fill: 'bg-tree-untested border border-line-line2',
    text: 'text-text-main',
    sub: 'text-text-sub2',
  },
  weak: {
    fill: 'bg-tree-weak',
    text: 'text-orange-12',
    sub: 'text-orange-12/70',
  },
  progress: {
    fill: 'bg-tree-progress',
    text: 'text-white',
    sub: 'text-white/85',
  },
  mastered: {
    fill: 'bg-tree-mastered',
    text: 'text-white',
    sub: 'text-white/85',
  },
};

type TreeNodeButtonProps = {
  node: TreeNodeView;
  onSelect: (node: TreeNodeView) => void;
};

/* ─────────────────────────────────────────────────────
 * 단원 노드 버튼
 *  - 오렌지 강도 fill + 정복도 % 항상 표시
 *  - 반복 막힘 ⚠ 마커(노드 색은 안 바꿈)
 *  - 모의(자기신고) 옅은 "모의" 태그
 *  - 터치 타깃 ≥44px (-0)
 * ────────────────────────────────────────────────────*/
export const TreeNodeButton = ({ node, onSelect }: TreeNodeButtonProps) => {
  const style = INTENSITY_STYLE[node.intensity];

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      className={cn(
        '-0 rounded-card relative flex h-full flex-col justify-between p-4 text-left',
        'transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99]',
        'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        style.fill
      )}
      aria-label={`${node.displayName} 정복도 ${node.masteryScore}퍼센트${
        node.stuck ? ', 반복 막힘' : ''
      }`}
    >
      {/* 막힘 마커 — 색은 안 바꾸고 우상단 ⚠ */}
      {node.stuck && (
        <span className="absolute top-2 right-2">
          <AlertTriangle
            size={16}
            className="text-system-warning"
            aria-hidden
          />
        </span>
      )}

      <div className="flex flex-col gap-1 pr-5">
        <span
          className={cn(
            'font-body2-heading line-clamp-2 text-balance break-keep',
            style.text
          )}
        >
          {node.displayName}
        </span>
        {node.diagnosedOnly && (
          <span
            className={cn(
              'font-caption-normal w-fit rounded-full px-1.5 py-0.5',
              node.intensity === 'untested'
                ? 'text-text-sub2 bg-white/70'
                : 'bg-white/25 text-white'
            )}
          >
            모의
          </span>
        )}
      </div>

      <span className={cn('font-headline2-heading tabular-nums', style.text)}>
        {node.masteryScore}%
      </span>
    </button>
  );
};

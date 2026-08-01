import type { GrowthStage } from '@/entities/growth';

type Props = {
  stage: GrowthStage;
  size?: number;
  className?: string;
};

const STAGE_PRESET: Record<
  GrowthStage,
  { leaf: string; stem: string; opacity: number }
> = {
  HEALTHY: { leaf: '#ff4805', stem: '#8a6a52', opacity: 1 },
  WILTING: { leaf: '#ffd0c0', stem: '#8a6a52', opacity: 1 },
  WITHERED: { leaf: '#e8d5cd', stem: '#9a8a7c', opacity: 1 },
  DORMANT: { leaf: '#e5e3df', stem: '#a8a29a', opacity: 0.9 },
};

/**
 * 온도나무 아이콘 — 백엔드의 성장 단계 4종을 MVP-G v3 표현에 매핑한다.
 */
export const TreeIcon = ({ stage, size = 46, className }: Props) => {
  const preset = STAGE_PRESET[stage];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ opacity: preset.opacity, flexShrink: 0 }}
      aria-hidden
    >
      <path
        d="M50 62 V42"
        stroke={preset.stem}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx={50}
        cy={26}
        rx={13}
        ry={20}
        fill={preset.leaf}
      />
      <ellipse
        cx={33}
        cy={38}
        rx={13}
        ry={20}
        fill={preset.leaf}
        transform="rotate(-35 33 38)"
      />
      <ellipse
        cx={67}
        cy={38}
        rx={13}
        ry={20}
        fill={preset.leaf}
        transform="rotate(35 67 38)"
      />
      <path
        d="M32 62 h36 l-5 30 q-1 5 -6 5 h-14 q-5 0 -6 -5 z"
        fill="#fff"
        stroke="#d8d0c8"
        strokeWidth={2}
      />
      <rect
        x={30}
        y={60}
        width={40}
        height={7}
        rx={3.5}
        fill="#efe7df"
        stroke="#d8d0c8"
        strokeWidth={1.5}
      />
    </svg>
  );
};

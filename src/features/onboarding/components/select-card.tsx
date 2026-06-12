'use client';

import { cn } from '@/shared/lib';

/* ─────────────────────────────────────────────────────
 * 큰 RadioCard — 학년·선택과목 단일 선택
 *  라벨 + meta. 선택 시 오렌지 보더 + 옅은 배경 + 라디오 점.
 *  터치 타깃 ≥44px (py-4 → 56px). 고정 안내(disabled)도 지원.
 * ────────────────────────────────────────────────────*/
type SelectCardProps = {
  label: string;
  meta?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export const SelectCard = ({
  label,
  meta,
  selected,
  disabled,
  onSelect,
}: SelectCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={disabled}
    onClick={onSelect}
    className={cn(
      'flex w-full items-center justify-between rounded-[12px] border bg-white px-[18px] py-4 text-left transition',
      'focus-visible:ring-key-color-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      selected
        ? 'border-key-color-primary bg-background-orange'
        : 'border-line-line1',
      disabled && 'cursor-default opacity-90'
    )}
  >
    <span className="flex flex-col gap-0.5">
      <span
        className={cn(
          'font-body1-heading',
          selected ? 'text-orange-10' : 'text-text-main'
        )}
      >
        {label}
      </span>
      {meta && (
        <span className="font-caption-normal text-text-sub2">{meta}</span>
      )}
    </span>
    {!disabled && (
      <span
        className={cn(
          'size-[22px] shrink-0 rounded-full border-2',
          selected
            ? 'border-key-color-primary bg-[radial-gradient(circle,var(--color-key-color-primary)_0_6px,#fff_6px_9px,var(--color-key-color-primary)_9px)]'
            : 'border-line-line2'
        )}
        aria-hidden
      />
    )}
  </button>
);

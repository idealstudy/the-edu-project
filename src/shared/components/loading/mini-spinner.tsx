'use client';

import { cn } from '@/shared/lib/utils';

type SpinnerProps = {
  size?: number; // px 단위
  className?: string;
};

export const MiniSpinner = ({ size = 32, className }: SpinnerProps) => {
  return (
    <div
      role="status"
      aria-label="loading"
      className={cn('inline-flex items-center justify-center', className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-spin text-gray-400"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </div>
  );
};

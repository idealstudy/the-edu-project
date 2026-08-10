import { cn } from '@/shared/lib';
import { Check } from 'lucide-react';

type ReviewStampsProps = {
  filled: number;
  total: number;
  className?: string;
};

export const ReviewStamps = ({
  filled,
  total,
  className,
}: ReviewStampsProps) => {
  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-label={`${total}회독 중 ${filled}회 완료`}
    >
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index < filled;
        const isNext = index === filled;

        return (
          <span
            key={index}
            aria-hidden
            className={cn(
              'text-ui-compact grid size-5.5 place-items-center rounded-full border font-extrabold',
              isFilled && 'border-orange-7 bg-orange-2 text-orange-9',
              isNext && 'border-orange-7 bg-gray-white text-orange-9',
              !isFilled && !isNext && 'border-gray-3 bg-gray-white text-gray-5'
            )}
          >
            {isFilled ? (
              <Check
                size={12}
                strokeWidth={3}
              />
            ) : (
              index + 1
            )}
          </span>
        );
      })}
      <span className="font-caption-heading text-gray-8 ml-1 tabular-nums">
        {Math.min(filled + 1, total)}회독째
      </span>
    </div>
  );
};

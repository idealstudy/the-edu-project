import { cn } from '@/shared/lib';

type UnitNoteLeafProps = {
  level: 'GRAY' | 'LIT' | 'DEEP';
  className?: string;
};

export const UnitNoteLeaf = ({ level, className }: UnitNoteLeafProps) => (
  <span
    aria-hidden
    className={cn(
      'block size-9 shrink-0 -rotate-[20deg] rounded-[50%_50%_50%_5px] border',
      level === 'GRAY' && 'border-gray-3 bg-gray-2',
      level === 'LIT' && 'border-orange-4 bg-orange-3',
      level === 'DEEP' && 'border-orange-7 bg-orange-7',
      className
    )}
  />
);

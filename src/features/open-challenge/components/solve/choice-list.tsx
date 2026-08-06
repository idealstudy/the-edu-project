import { cn } from '@/shared/lib';

type ChoiceListProps = {
  choices: string[];
  selected: string | null;
  onSelect: (choice: string) => void;
};

export const ChoiceList = ({
  choices,
  selected,
  onSelect,
}: ChoiceListProps) => {
  const desktopColsClass =
    choices.length >= 5
      ? 'md:grid-cols-5'
      : choices.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-4';

  return (
    <div className={cn('grid grid-cols-1 gap-3', desktopColsClass)}>
      {choices.map((choice, idx) => {
        const isSelected = selected === choice;
        return (
          <button
            type="button"
            key={idx}
            data-testid={`choice-option-${idx}`}
            onClick={() => onSelect(choice)}
            className={cn(
              'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-colors md:flex-col md:py-5',
              isSelected
                ? 'border-orange-7 bg-orange-1 text-orange-8'
                : 'border-line-line1 text-text-main hover:border-line-line2 hover:bg-gray-1 bg-white'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                isSelected ? 'bg-orange-7 text-white' : 'bg-gray-1 text-gray-8'
              )}
            >
              {idx + 1}
            </span>
            {choice !== String(idx + 1) && <span>{choice}</span>}
          </button>
        );
      })}
    </div>
  );
};

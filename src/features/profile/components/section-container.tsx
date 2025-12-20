import { cn } from '@/shared/lib';

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export default function SectionContainer({
  title,
  children,
  className,
  action,
}: Props) {
  return (
    <div
      className={cn(
        'border-line-line1 flex flex-col gap-9 rounded-xl border bg-white p-8',
        className
      )}
    >
      <div className="flex justify-between">
        <h3 className="font-headline1-heading">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

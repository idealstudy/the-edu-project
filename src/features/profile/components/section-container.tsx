import ComingSoonSection from '@/features/profile/components/coming-soon-section';
import { MiniSpinner } from '@/shared/components/loading';
import { cn } from '@/shared/lib';

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  isOwner?: boolean;
  isLoading?: boolean;
  isError?: boolean;
};

export default function SectionContainer({
  title,
  children,
  className,
  action,
  isOwner = false,
  isLoading = false,
  isError = false,
}: Props) {
  const renderContent = () => {
    if (isLoading) return <MiniSpinner />;
    if (isError) return <ComingSoonSection />;
    return children;
  };
  return (
    <div
      className={cn(
        'border-line-line1 flex flex-col gap-2 rounded-xl border bg-white px-8 py-6',
        className
      )}
    >
      <div className="flex justify-between">
        <h3 className="font-headline1-heading mb-2">{title}</h3>
        {isOwner && action}
      </div>
      {renderContent()}
    </div>
  );
}

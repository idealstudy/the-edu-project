import { cn } from '@/shared/lib';

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

const DashboardSection = ({
  title,
  description,
  children,
  className,
}: Props) => {
  return (
    <div
      className={cn('flex w-full flex-col gap-6', 'tablet:gap-8', className)}
      aria-labelledby={`dashboard-section-${title}`}
    >
      <div className="flex flex-col gap-1">
        <h1
          className={cn(
            'font-body1-heading tablet:font-headline1-heading text-gray-12'
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              'font-label-normal tablet:font-body2-normal text-gray-11 tablet:text-gray-10'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardSection;

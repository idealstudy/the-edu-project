import React from 'react';

import { cn } from '@/shared/lib';

type EmptyStateProps = React.ComponentPropsWithRef<'section'> & {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) => (
  <section
    className={cn(
      'border-line-line1 rounded-card px-empty-pad-x py-empty-pad-y flex min-w-0 flex-col items-center border border-dashed bg-white text-center',
      className
    )}
    {...props}
  >
    {icon && <div className="text-gray-7 mb-content-gap">{icon}</div>}
    <h3 className="font-body2-heading text-text-main text-heading-wrap">
      {title}
    </h3>
    {description && (
      <p className="font-caption-normal text-gray-9 text-two-lines mt-content-gap max-w-full">
        {description}
      </p>
    )}
    {action && <div className="mt-card-pad">{action}</div>}
  </section>
);

import React from 'react';

import { cn } from '@/shared/lib';

type ExamTakeLayoutProps = React.ComponentPropsWithRef<'div'> & {
  folded?: boolean;
};

export const ExamTakeLayout = ({
  folded = false,
  className,
  ...props
}: ExamTakeLayoutProps) => (
  <div
    className={cn(
      'gap-exam-layout-gap grid min-w-0',
      folded ? 'grid-exam-take-folded' : 'md:grid-exam-take grid-cols-1',
      className
    )}
    {...props}
  />
);

export const ExamWizardLayout = ({
  className,
  ...props
}: React.ComponentPropsWithRef<'div'>) => (
  <div
    className={cn(
      'gap-exam-layout-gap lg:grid-exam-wizard grid min-w-0 grid-cols-1',
      className
    )}
    {...props}
  />
);

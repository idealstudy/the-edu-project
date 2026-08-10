import React from 'react';

import { cn } from '@/shared/lib';

type CardProps = React.ComponentPropsWithRef<'section'>;
type CardSectionProps = React.ComponentPropsWithRef<'div'>;

const CardRoot = ({ className, ...props }: CardProps) => (
  <section
    className={cn(
      'border-line-line1 rounded-card p-card-pad min-w-0 border bg-white',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: CardSectionProps) => (
  <div
    className={cn(
      'mb-grid-gap gap-content-gap flex min-w-0 items-start justify-between',
      className
    )}
    {...props}
  />
);

const CardTitle = ({
  className,
  ...props
}: React.ComponentPropsWithRef<'h3'>) => (
  <h3
    className={cn(
      'font-body2-heading text-text-main text-heading-wrap min-w-0',
      className
    )}
    {...props}
  />
);

const CardDescription = ({
  className,
  ...props
}: React.ComponentPropsWithRef<'p'>) => (
  <p
    className={cn(
      'font-caption-normal text-gray-9 text-two-lines min-w-0',
      className
    )}
    {...props}
  />
);

const CardContent = ({ className, ...props }: CardSectionProps) => (
  <div
    className={cn('text-break-safe min-w-0', className)}
    {...props}
  />
);

const CardFooter = ({ className, ...props }: CardSectionProps) => (
  <div
    className={cn(
      'mt-block-gap gap-content-gap flex min-w-0 items-center',
      className
    )}
    {...props}
  />
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});

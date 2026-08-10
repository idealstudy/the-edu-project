import React from 'react';

import { cn } from '@/shared/lib';
import { VariantProps, cva } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { Slot } from 'radix-ui';

export type ButtonProps = React.ComponentPropsWithRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: React.ReactNode;
  };

const buttonVariants = cva(
  cn(
    'focus-ring inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-button border font-label-heading transition-colors duration-150',
    'disabled:border-line-line2 disabled:bg-background-inactive disabled:text-text-inactive disabled:pointer-events-none',
    'active:translate-y-px'
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'border-orange-10 bg-orange-9 text-white',
          'hover:bg-orange-10 active:bg-orange-11'
        ),
        secondary: cn(
          'border-orange-9 bg-white text-orange-9',
          'hover:bg-orange-1 active:bg-orange-2'
        ),
        outlined: cn(
          'border-line-line2 bg-white text-text-main',
          'hover:bg-gray-1 active:bg-gray-2'
        ),
        ghost:
          'border-transparent bg-transparent text-text-main hover:bg-gray-1 active:bg-gray-2',
        danger:
          'border-system-warning bg-system-warning text-white hover:opacity-90 active:opacity-80',
        unstyled: '',
      },
      size: {
        large:
          'h-control-xl px-button-wide-x font-headline2-heading disabled:font-headline2-normal',
        medium:
          'h-control-md px-button-default-x font-body2-heading disabled:font-body2-normal',
        small:
          'h-control-sm px-button-compact-x font-body2-heading disabled:font-body2-normal',
        xsmall:
          'h-control-xs px-button-compact-x font-body2-heading disabled:font-body2-normal',
        cta: 'min-h-control-lg px-button-default-x font-label-heading shadow-cta active:shadow-none',
        compact: 'min-h-control-sm px-button-compact-x font-caption-heading',
        chip: 'min-h-control-sm rounded-pill px-button-chip-x font-caption-heading',
        icon: 'size-touch-min p-0',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
);

export const Button = ({
  className,
  variant,
  size,
  children,
  asChild = false,
  isLoading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot.Root : 'button';
  const isUnstyled = variant === 'unstyled';

  return (
    <Component
      type={asChild ? undefined : 'button'}
      className={cn(
        isUnstyled
          ? 'focus-ring disabled:pointer-events-none'
          : buttonVariants({ variant, size }),
        className
      )}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || disabled || undefined}
      disabled={asChild ? undefined : isLoading || disabled}
      {...props}
    >
      {asChild ? (
        children
      ) : isLoading ? (
        <>
          <LoaderCircle
            aria-hidden="true"
            className="mr-inline-gap size-4 animate-spin"
          />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Component>
  );
};

'use client';

import React from 'react';

import { cn } from '@/shared/lib';
import { Switch as SwitchPrimitive } from 'radix-ui';

type ToggleProps = React.ComponentProps<typeof SwitchPrimitive.Root>;

const Toggle = ({ className, ...props }: ToggleProps) => {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'size-touch-min relative shrink-0 cursor-pointer bg-transparent',
        'before:bg-gray-3 before:absolute before:top-3 before:left-1 before:h-5 before:w-9 before:rounded-full before:transition-colors before:duration-100',
        'data-[state=checked]:before:bg-orange-7',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'tablet:before:top-2.5 tablet:before:left-0 tablet:before:h-6 tablet:before:w-11',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none absolute top-3.5 left-1.5 block size-4 rounded-full bg-white shadow-sm transition-transform duration-100',
          'data-[state=checked]:translate-x-4.5',
          'tablet:top-3 tablet:left-0.5 tablet:size-5 tablet:data-[state=checked]:translate-x-5.5'
        )}
      />
    </SwitchPrimitive.Root>
  );
};

export { Toggle };

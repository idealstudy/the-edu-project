import React from 'react';

import { cn } from '@/shared/lib';

type TextareaProps = React.ComponentPropsWithRef<'textarea'>;

export const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        'border-line-line2 placeholder:text-gray-scale-gray-50 w-full rounded-sm border px-6 py-4 outline-none',
        'focus-visible:border-line-line3',
        'disabled:border-text-inactive disabled:bg-gray-scale-gray-1 disabled:text-text-inactive',
        className
      )}
      {...props}
    />
  );
};

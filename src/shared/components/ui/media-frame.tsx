import React from 'react';

import { cn } from '@/shared/lib';

type MediaFrameProps = React.ComponentPropsWithRef<'div'> & {
  fit?: 'cover' | 'contain';
};

export const MediaFrame = ({
  fit = 'cover',
  className,
  ...props
}: MediaFrameProps) => (
  <div
    className={cn(
      'rounded-card bg-gray-1 relative min-w-0 overflow-hidden [&>img]:h-full [&>img]:max-h-full [&>img]:w-full [&>img]:max-w-full',
      fit === 'cover' ? '[&>img]:object-cover' : '[&>img]:object-contain',
      className
    )}
    {...props}
  />
);

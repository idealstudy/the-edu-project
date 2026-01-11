'use client';

import { type ReactNode, forwardRef } from 'react';

import Link from 'next/link';

import { cn } from '@/shared/lib/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = forwardRef<
  HTMLDivElement,
  PopoverPrimitive.PopoverContentProps
>(({ className, align = 'center', sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-[280px] rounded-2xl bg-white p-4 text-gray-900 shadow-lg ring-1 ring-black/5 outline-none',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverClose = PopoverPrimitive.Close;
const PopoverArrow = PopoverPrimitive.Arrow;

// PopoverLink - Link 컴포넌트를 사용하는 아이템
interface PopoverLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const PopoverLink = forwardRef<HTMLAnchorElement, PopoverLinkProps>(
  ({ href, children, className, onClick, ...props }, ref) => (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
);
PopoverLink.displayName = 'PopoverLink';

// PopoverItem - 버튼 형태의 아이템
interface PopoverItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

const PopoverItem = forwardRef<HTMLButtonElement, PopoverItemProps>(
  ({ children, className, onClick, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
        variant === 'default' && 'text-gray-700 hover:bg-gray-100',
        variant === 'danger' && 'text-red-600 hover:bg-red-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
PopoverItem.displayName = 'PopoverItem';

// PopoverSeparator - 구분선
interface PopoverSeparatorProps {
  className?: string;
}

const PopoverSeparator = forwardRef<HTMLDivElement, PopoverSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('my-2 h-px bg-gray-200', className)}
      {...props}
    />
  )
);
PopoverSeparator.displayName = 'PopoverSeparator';

// PopoverSection - 섹션 헤더
interface PopoverSectionProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

const PopoverSection = forwardRef<HTMLDivElement, PopoverSectionProps>(
  ({ children, className, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between px-3 py-2', className)}
      {...props}
    >
      <div className="flex items-center gap-3 text-sm font-semibold text-gray-900">
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
);
PopoverSection.displayName = 'PopoverSection';

// PopoverNav - 네비게이션 래퍼
interface PopoverNavProps {
  children: ReactNode;
  className?: string;
}

const PopoverNav = forwardRef<HTMLElement, PopoverNavProps>(
  ({ children, className, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {children}
    </nav>
  )
);
PopoverNav.displayName = 'PopoverNav';

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
  PopoverLink,
  PopoverItem,
  PopoverSeparator,
  PopoverSection,
  PopoverNav,
};

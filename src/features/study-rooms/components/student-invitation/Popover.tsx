import { cn } from '@/lib/utils';
import { Popover as PopoverPrimitives } from 'radix-ui';

type PopoverProps = React.ComponentPropsWithRef<typeof PopoverPrimitives.Root>;

const Popover = ({ children, ...props }: PopoverProps) => {
  return <PopoverPrimitives.Root {...props}>{children}</PopoverPrimitives.Root>;
};

type PopoverTriggerProps = React.ComponentPropsWithRef<
  typeof PopoverPrimitives.Trigger
>;

const PopoverTrigger = ({ children, ...props }: PopoverTriggerProps) => {
  return (
    <PopoverPrimitives.Trigger {...props}>{children}</PopoverPrimitives.Trigger>
  );
};

type PopoverContentProps = React.ComponentPropsWithRef<
  typeof PopoverPrimitives.Content
>;

const PopoverContent = ({
  className,
  children,
  sideOffset = 8,
  ...props
}: PopoverContentProps) => {
  return (
    <PopoverPrimitives.Portal>
      <PopoverPrimitives.Content
        className={cn(
          'bg-gray-scale-white border-line-line2 relative z-50 overflow-y-auto rounded-[4px] border outline-hidden',
          'min-w-[var(--radix-popover-trigger-width)]',
          'max-h-[calc(var(--radix-popover-content-available-height)-8px)]',
          className
        )}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </PopoverPrimitives.Content>
    </PopoverPrimitives.Portal>
  );
};

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Close = PopoverPrimitives.Close;

export { Popover };

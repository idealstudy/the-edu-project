import { cn } from '@/shared/lib/utils';
import { Tabs as TabsPrimitives } from 'radix-ui';

type TabsProps = TabsPrimitives.TabsProps;

const Tabs = ({ ...props }: TabsProps) => {
  return <TabsPrimitives.Root {...props} />;
};

type TabsTriggerProps = TabsPrimitives.TabsTriggerProps;

const TabsTrigger = ({ className, children, ...props }: TabsTriggerProps) => {
  return (
    <TabsPrimitives.Trigger
      className={cn(
        'group border-line-line1 rounded-t-card relative flex h-13.75 min-w-42.5 cursor-pointer items-center justify-center gap-2 border border-b-0 px-5',
        'text-text-sub2 text-lg',
        'bg-transparent',
        '[&>svg]:text-text-inactive mock-[state=active]:[&>svg]:text-key-color-primary',
        'mock-[state=active]:text-key-color-primary mock-[state=active]:bg-gray-scale-white mock-[state=active]:font-semibold',
        className
      )}
      {...props}
    >
      {children}
      <span
        role="presentation"
        className="bg-gray-scale-white absolute right-0 -bottom-0.25 left-0 hidden h-0.25 group-data-[state=active]:flex"
      />
    </TabsPrimitives.Trigger>
  );
};

type TabsListProps = TabsPrimitives.TabsListProps;

const TabsList = ({ className, children, ...props }: TabsListProps) => {
  return (
    <TabsPrimitives.List
      className={cn('flex gap-2', className)}
      {...props}
    >
      {children}
    </TabsPrimitives.List>
  );
};

Tabs.Trigger = TabsTrigger;
Tabs.List = TabsList;
Tabs.Content = TabsPrimitives.Content;

export { Tabs };

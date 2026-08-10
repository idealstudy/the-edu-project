import { cn } from '@/shared/lib';

type ColumnLayoutProps = React.ComponentPropsWithRef<'div'>;

const ColumnLayout = ({ className, children, ...props }: ColumnLayoutProps) => {
  return (
    <main
      className={cn(
        'max-w-page-max gap-room-gap px-room-page-mobile py-room-page-mobile tablet:px-room-page tablet:py-room-page desktop:flex-row mx-auto flex w-full min-w-0 flex-col',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
};

type ColumnLayoutStickyProps = React.ComponentPropsWithRef<'section'>;

const ColumnLayoutLeft = ({
  className,
  children,
  ...props
}: ColumnLayoutStickyProps) => {
  return (
    <section
      className={cn(
        'desktop:w-room-aside desktop:sticky top-column-sticky w-full min-w-0 shrink-0',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};
type ColumnLayoutRightProps = React.ComponentPropsWithRef<'section'>;

const ColumnLayoutRight = ({
  className,
  children,
  ...props
}: ColumnLayoutRightProps) => {
  return (
    <section
      className={cn('desktop:max-w-room-content-max w-full min-w-0', className)}
      {...props}
    >
      {children}
    </section>
  );
};

type ColumnLayoutBottomProps = React.ComponentPropsWithRef<'section'>;

const ColumnLayoutBottom = ({
  className,
  children,
  ...props
}: ColumnLayoutBottomProps) => {
  return (
    <section
      className={cn('w-full min-w-0', className)}
      {...props}
    >
      {children}
    </section>
  );
};

ColumnLayout.Left = ColumnLayoutLeft;
ColumnLayout.Right = ColumnLayoutRight;
ColumnLayout.Bottom = ColumnLayoutBottom;

export { ColumnLayout };

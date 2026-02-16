import { cn } from '@/shared/lib';

type ColumnLayoutProps = React.ComponentPropsWithRef<'div'>;

const ColumnLayout = ({ className, children, ...props }: ColumnLayoutProps) => {
  return (
    <main
      className={cn(
        // 중앙 정렬 + 최대 너비
        'mx-auto w-full max-w-[1200px]',

        // 좌우 여백
        'tablet:px-8 px-4',

        // 레이아웃
        'desktop:flex-row desktop:py-8 flex flex-col gap-5 py-4',

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
        'desktop:w-[360px] desktop:sticky top-[calc(var(--spacing-header-height)+40px)] w-full shrink-0',
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
      className={cn('desktop:max-w-[600px] w-full', className)}
      {...props}
    >
      {children}
    </section>
  );
};

ColumnLayout.Left = ColumnLayoutLeft;
ColumnLayout.Right = ColumnLayoutRight;

export { ColumnLayout };

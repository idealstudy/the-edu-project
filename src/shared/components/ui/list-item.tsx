'use client';

import Link from 'next/link';

import { cn } from '@/shared/lib';

type ListItemBaseProps = {
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  warn?: string;
  id: number;
  tag?: React.ReactNode;
  rightTitle?: React.ReactNode;
  dropdown?: React.ReactNode;
  rightSubTitle?: string;
  dataTestId?: string;
  titleTestId?: string;
};

const LIST_ITEM_CLASS =
  'font-body2-normal hover:bg-gray-1 desktop:max-w-room-content-max flex min-h-flat-row w-full min-w-0 flex-row items-center justify-between gap-column-gap rounded-card bg-white px-card-pad py-block-gap';

const ListItemContent = ({
  title,
  subtitle,
  tag,
  icon,
  warn,
  rightTitle,
  dropdown,
  rightSubTitle,
  titleTestId,
}: Omit<ListItemBaseProps, 'id' | 'dataTestId'>) => {
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
        {icon}
        {warn && (
          <div className="bg-system-warning-alt text-system-warning rounded-pill font-caption-heading flex min-w-16 items-center justify-center px-1.5 py-0.5 text-center ring-1 ring-current">
            {warn}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col items-start justify-between">
          <div className="flex max-w-full min-w-0 flex-row items-center gap-2">
            <p
              data-testid={titleTestId}
              className="text-single-line mb-1"
            >
              {title}
            </p>
            {tag && tag}
          </div>
          <p className="font-caption-normal text-gray-9 text-single-line max-w-full">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <div className="flex flex-row items-center gap-1">
          <p
            data-testid="student-check-submit"
            className="text-gray-9 numeric-tabular"
          >
            {rightTitle}
          </p>
          <div
            className="flex shrink-0 flex-row items-center"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {dropdown}
          </div>
        </div>
        <p className="font-caption-normal text-gray-9 text-break-safe">
          {rightSubTitle}
        </p>
      </div>
    </>
  );
};

const ListItemRoot = ({
  title,
  subtitle,
  tag,
  id,
  href,
  icon,
  warn,
  rightTitle,
  dropdown,
  rightSubTitle,
  dataTestId,
  titleTestId,
}: ListItemBaseProps & {
  href: string;
}) => {
  return (
    <Link
      key={id}
      className={LIST_ITEM_CLASS}
      href={href}
      data-testid={dataTestId}
    >
      <ListItemContent
        title={title}
        subtitle={subtitle}
        tag={tag}
        icon={icon}
        warn={warn}
        rightTitle={rightTitle}
        dropdown={dropdown}
        rightSubTitle={rightSubTitle}
        titleTestId={titleTestId}
      />
    </Link>
  );
};

const ListItemButton = ({
  title,
  subtitle,
  tag,
  id,
  icon,
  warn,
  rightTitle,
  dropdown,
  rightSubTitle,
  dataTestId,
  titleTestId,
  onClick,
}: ListItemBaseProps & {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button
      key={id}
      type="button"
      className={cn(LIST_ITEM_CLASS, 'cursor-pointer')}
      data-testid={dataTestId}
      onClick={onClick}
    >
      <ListItemContent
        title={title}
        subtitle={subtitle}
        tag={tag}
        icon={icon}
        warn={warn}
        rightTitle={rightTitle}
        dropdown={dropdown}
        rightSubTitle={rightSubTitle}
        titleTestId={titleTestId}
      />
    </button>
  );
};

export const ListItem = Object.assign(ListItemRoot, {
  Button: ListItemButton,
});

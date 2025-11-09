import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/components/ui/icon';
import {
  RecentNoteCardProps,
  StudyRoomCardProps,
} from '@/features/dashboard/types';
import { cn } from '@/lib/utils';

interface DashboardContentsCardProps {
  title: string;
  subtitle: string;
  badge: React.ReactNode;
  footer: React.ReactNode;
  image?: React.ReactNode;
  href?: string;
}

const DashboardContentsCard = ({
  title,
  subtitle,
  badge,
  image,
  footer,
  href,
}: DashboardContentsCardProps) => {
  const hasImage = !!image;
  const cardContent = (
    <article
      className={cn(
        'border-line-line1/60 bg-system-background hover:border-key-color-primary flex rounded-[24px] border p-6 transition-colors duration-150 hover:bg-white',
        !hasImage && 'flex-col gap-4',
        hasImage && 'flex-row gap-4'
      )}
    >
      {image}
      <div
        className={cn('flex flex-col', hasImage && 'flex-1 justify-between')}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-text-main text-lg font-semibold">{title}</h3>
            <p className="text-text-sub2 text-sm">{subtitle}</p>
          </div>
          {badge}
        </div>
        <div
          className={cn(
            'text-text-sub1 flex flex-col gap-2 text-sm',
            hasImage && 'mt-auto'
          )}
        >
          {footer}
        </div>
      </div>
    </article>
  );

  if (href) return <Link href={href}>{cardContent}</Link>;
  return cardContent;
};

const StudyRoomCard = ({ room }: StudyRoomCardProps) => {
  const roomImg = (
    <Image
      src={'/studyroom/profile.svg'}
      alt={'스터디룸 리스트 이미지'}
      width={100}
      height={100}
      className="h-16 w-16 rounded-full object-cover"
    />
  );

  const badge = (
    <span className="text-key-color-primary inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-[0_6px_18px_rgba(255,72,5,0.18)]">
      {room.memberCount}명 참여중
    </span>
  );

  const footer = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="bg-key-color-primary h-2 w-2 rounded-full"
        />
        {room.schedule}
      </div>
      <div className="text-key-color-primary flex items-center gap-2">
        <Icon.ChevronRight
          aria-hidden
          className="h-4 w-4"
        />
        {room.nextLesson}
      </div>
    </div>
  );

  return (
    <DashboardContentsCard
      title={room.title}
      subtitle={room.subject}
      badge={badge}
      footer={footer}
      image={roomImg}
    />
  );
};

const RecentNoteCard = ({ note }: RecentNoteCardProps) => {
  const badge = (
    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2563EB] shadow-[0_6px_18px_rgba(37,99,235,0.18)]">
      {note.highlight}
    </span>
  );

  const footer = <p className="text-text-sub1 text-sm">{note.submittedAt}</p>;

  return (
    <DashboardContentsCard
      title={note.title}
      subtitle={note.studyRoom}
      badge={badge}
      footer={footer}
    />
  );
};

export const ContentsCard = {
  Room: StudyRoomCard,
  Note: RecentNoteCard,
};

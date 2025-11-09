import { ComponentPropsWithoutRef, ComponentType } from 'react';

export type DashboardSummaryCardProps = {
  card: SummaryCard;
};

export type IconComponent = ComponentType<ComponentPropsWithoutRef<'svg'>>;

export type SummaryCard = {
  id: string;
  icon: IconComponent;
  title: string;
  value: string;
  description: string;
  accentClassName: string;
  iconClassName: string;
  badge?: {
    label: string;
    className?: string;
  };
};

export type StudyRoom = {
  id: number;
  title: string;
  subject: string;
  schedule: string;
  nextLesson: string;
  memberCount: number;
};

export type RecentNote = {
  id: number;
  title: string;
  studyRoom: string;
  submittedAt: string;
  highlight: string;
};

export type MarketingAsset = {
  id: string;
  title: string;
  summary: string;
  description: string;
  href: string;
  ctaLabel: string;
};

export type StudyRoomCardProps = {
  room: StudyRoom;
};

export type RecentNoteCardProps = {
  note: RecentNote;
};

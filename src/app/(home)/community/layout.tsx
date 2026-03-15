import type { Metadata } from 'next';

import { SITE_CONFIG } from '@/config/site';

import CommunityLayoutClient from './community-layout-client';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunityLayoutClient>{children}</CommunityLayoutClient>;
}

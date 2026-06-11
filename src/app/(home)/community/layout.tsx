import type { Metadata } from 'next';

import { SITE_CONFIG } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 시 사이드바 셸은 상위 (home)/layout.tsx 의 AppShell 이 담당한다.
  return <>{children}</>;
}

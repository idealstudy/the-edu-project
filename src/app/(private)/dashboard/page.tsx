import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { resolveDashboardFromRedirect } from '@/features/auth/lib/redirect';
import { PRIVATE } from '@/shared/constants';
import { fetchMemberRole } from '@/shared/lib/server';

// import { EmptyConnectionDialog } from '@/features/dashboard/connect/components/empty-connection-dialog';

const SITE_NAME = '디에듀';
const SITE_URL = 'https://d-edu.site/';
const OG_IMAGE = '/og_image.png';

export const metadata: Metadata = {
  title: `${SITE_NAME} | 수업·숙제·피드백까지 학습의 흐름을 깔끔하게`,
  description:
    '학생·학부모·선생님이 함께 쓰는 스터디룸. 수업 기록과 초대가 쉬워집니다.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  // 공통 (카카오톡 / 페이스북 / 디스코드 / 슬랙)
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 수업·숙제·피드백까지 학습의 흐름을 깔끔하게`,
    description:
      '학생·학부모·선생님이 함께 쓰는 스터디룸. 수업 기록과 초대가 쉬워집니다.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} 홈 미리보기`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | 수업·숙제·피드백까지 학습의 흐름을 깔끔하게`,
    description:
      '학생·학부모·선생님이 함께 쓰는 스터디룸. 수업 기록과 초대가 쉬워집니다.',
    images: [OG_IMAGE],
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // OAuth 전용 리다이렉트 (기존 카카오 회원 등 — 신규회원 select-role 경로와 동일하게
  // sanitizeRedirect 오픈 리다이렉트 가드를 거친 안전한 경로만 복귀시킨다)
  const { from } = await searchParams;
  const safeFrom = resolveDashboardFromRedirect(from);
  if (safeFrom) redirect(safeFrom);

  const session = await fetchMemberRole();

  if (session.status !== 'authenticated') return null;

  switch (session.role) {
    case 'ROLE_TEACHER':
      redirect(PRIVATE.DASHBOARD.TEACHER);
    case 'ROLE_STUDENT':
      redirect(PRIVATE.DASHBOARD.STUDENT);
    case 'ROLE_PARENT':
      redirect(PRIVATE.DASHBOARD.PARENT);
    default:
      return null;
  }
}

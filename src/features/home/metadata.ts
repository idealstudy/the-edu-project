import { Metadata } from 'next';

import { SITE_CONFIG } from '@/config/site';

export const homeMetadata: Metadata = {
  title: `${SITE_CONFIG.name} | ${SITE_CONFIG.description}`,
  description:
    '많이가 아니라 제대로 풀어야 오른다. 제대로 푼 만큼 내 약점 지도가 오렌지로 채워집니다. 막히면 AI 코치와 한 걸음씩.',
  keywords: [
    '문제 풀이',
    '약점 트리',
    'AI 코치',
    '수학 문제',
    '오픈챌린지',
    '디에듀',
  ],
  alternates: { canonical: `${SITE_CONFIG.url}/welcome` },

  // 공통 (카카오톡 / 페이스북 / 디스코드 / 슬랙)
  openGraph: {
    locale: 'ko_KR',
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.description}`,
    description: '많이가 아니라 제대로 풀어야 오른다. 제대로 푼 만큼 채워지는 약점 지도',
    url: `${SITE_CONFIG.url}/welcome`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - 제대로 푼 만큼 채워지는 약점 지도`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.description}`,
    description: '많이가 아니라 제대로 풀어야 오른다. 제대로 푼 만큼 채워지는 약점 지도',
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

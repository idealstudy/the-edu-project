import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/config/site';
import { MentorSoloView } from '@/features/teachers/components/mentor-solo-view';
import { MENTOR_PROFILE } from '@/features/teachers/mentor-profile';
import { PUBLIC } from '@/shared/constants';

type PageProps = {
  params: Promise<{ slug: string }>;
};

// /teachers/:slug — 알 수 없는 slug는 안전 404. 조성진 외 인물이
// 어떤 경로로도 렌더되지 않는다(frd §4.4 경계 케이스, 테스트로 강제
// 예정). slug는 PUBLIC.TEACHERS.MENTOR_SLUG 하나만 유효하다.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== PUBLIC.TEACHERS.MENTOR_SLUG) {
    return { title: SITE_CONFIG.name };
  }

  return {
    title: `${MENTOR_PROFILE.name} 선생님 | ${SITE_CONFIG.name} 대표 멘토`,
    description:
      '12년째 입시 수학을 지도하는 디에듀 대표 멘토 조성진 선생님. 관리 과정을 공개하고, 자력 풀이 원칙으로 끝까지 책임집니다.',
    alternates: { canonical: `${SITE_CONFIG.url}${PUBLIC.TEACHERS.DETAIL}` },
    robots: { index: true, follow: true },
  };
}

export default async function TeacherSoloProfilePage({ params }: PageProps) {
  const { slug } = await params;
  if (slug !== PUBLIC.TEACHERS.MENTOR_SLUG) notFound();

  return <MentorSoloView />;
}

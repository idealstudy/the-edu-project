import { redirect } from 'next/navigation';

import { PUBLIC } from '@/shared/constants';

// /teachers 는 목록이 아니라 단독 대표 프로필로 리다이렉트한다.
// frd-public-portal-v1 §4.4: 후보가 1인이면 "비교"라는 job이 소멸하므로
// listing 패턴은 오답 — 대표 멘토 조성진 단독 프로필(mentorSoloView)만 존재.
export default function TeachersIndexPage() {
  redirect(PUBLIC.TEACHERS.DETAIL);
}

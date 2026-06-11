import { redirect } from 'next/navigation';

// 오픈챌린지 리스트는 사이트 메인('/')으로 승격됨. 구 경로는 항구 리다이렉트로 호환 유지.
export default function OpenChallengeListRedirect() {
  redirect('/');
}

import { OnboardingStepper } from '@/features/onboarding';

export const metadata = {
  title: '온보딩',
  description:
    '학년·과목·등급·약점을 입력하고 한 문제를 풀면 내 약점 트리가 만들어져요.',
};

/* ─────────────────────────────────────────────────────
 * 온보딩 (/onboarding)
 *  학년 → 선택과목 → 등급 → 약점 대단원 → (선택)모의진단 →
 *  1문제 체험 → 약점 트리 공개. 전체화면 스텝퍼.
 *  진입 트리거는 최소 — 직접 /onboarding 접근 가능.
 * ────────────────────────────────────────────────────*/
export default function OnboardingPage() {
  return <OnboardingStepper />;
}

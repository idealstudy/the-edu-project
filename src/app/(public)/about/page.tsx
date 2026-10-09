import type { Metadata } from 'next';

// 영문 회사 소개. 해외 프로그램(Claude Startups 등) 심사자가 사업자 실체를 영어로
// 확인할 수 있게 둔다. 2026-10-09 신청 거절 사유 "회사를 확인하지 못함" 대응.
// 백엔드 호출이 없는 정적 페이지라 API가 내려가도 렌더된다.
export const metadata: Metadata = {
  title: 'About | Odokgong',
  description:
    'Odokgong (hongong.today) is a Korean middle and high school math tutoring platform operated by Jeongseong Company.',
  alternates: { canonical: '/about' },
};

const COMPANY_FACTS: ReadonlyArray<readonly [string, string]> = [
  ['Company', 'Jeongseong Company (정성컴퍼니)'],
  ['Service', 'Odokgong (오독공), https://hongong.today'],
  ['Founder & CEO', 'Seongjin Jo'],
  ['Founded', 'November 2025'],
  ['Business registration no.', '798-31-01774 (Republic of Korea)'],
  [
    'Address',
    'Room 203, 620-17 Yeoksam-dong, Gangnam-gu, Seoul, Republic of Korea',
  ],
  ['Contact', 'support@hongong.today'],
];

export default function AboutPage() {
  return (
    <main
      lang="en"
      className="mx-auto w-full max-w-3xl px-5 py-12"
    >
      <h1 className="text-gray-12 text-3xl font-bold">About Odokgong</h1>
      <p className="text-gray-9 mt-4 leading-7">
        Odokgong is a math tutoring platform for Korean middle and high school
        students. Every day a student solves one problem on their own. When they
        get stuck, a Socratic AI coach reads the problem and the student&apos;s
        work and asks guiding questions instead of giving the answer. Teachers
        review each student-AI conversation and leave feedback, so the AI
        supports the teacher rather than replacing them.
      </p>

      <h2 className="text-gray-12 mt-10 text-xl font-bold">Company</h2>
      <dl className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
        {COMPANY_FACTS.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 py-3 sm:grid-cols-3"
          >
            <dt className="text-gray-8 text-sm font-semibold">{label}</dt>
            <dd className="text-gray-12 text-sm sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}

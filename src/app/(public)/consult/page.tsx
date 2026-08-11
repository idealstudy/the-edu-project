import { Metadata } from 'next';

import { SITE_CONFIG } from '@/config/site';
import { ConsultCases } from '@/features/consult/components/consult-cases';
import { ConsultForm } from '@/features/consult/components/consult-form';

// MVP-G 공개 포털 /consult — 비회원 상담 리드 접수(신규 세로 슬라이스,
// frd-public-portal-v1 §4.5). 읽기(공개 사례)는 P 등급만 허용(§3.4) —
// 쓰기(ConsultForm)는 읽기 실패와 무관하게 항상 살아있다.
export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | 비공개 상담 신청`,
  description:
    '질문은 비공개로 접수하고, 동의받은 답변만 익명 사례로 공개합니다. 조성진 선생님이 직접 확인합니다.',
  alternates: { canonical: `${SITE_CONFIG.url}/consult` },
  robots: { index: true, follow: true },
};

export default function ConsultPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="bg-system-background w-full">
        <div className="mx-auto w-full max-w-shell-wide px-4 pt-8 pb-6 md:px-8 lg:px-20">
          <h1 className="font-title-heading mt-4 mb-2 text-2xl leading-[135%] tracking-tight lg:text-3xl">
            비공개 상담 신청
          </h1>
          <p className="font-body2-normal text-text-sub2">
            질문은 비공개로 접수하고, 동의받은 답변만 익명 사례로 공개합니다.
            상담 신청만으로는 어떤 권한도 생기지 않아요 — 그냥 선생님을 찾는
            학생·학부모로 남습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-shell-wide grid-cols-1 gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_420px] lg:px-20">
        <section>
          <ConsultForm />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-headline2-heading">공개된 상담 사례</h2>
          <ConsultCases />
        </section>
      </div>
    </div>
  );
}

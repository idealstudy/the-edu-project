import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/config/site';
import { repository } from '@/entities/consultation-lead';
import { PUBLIC } from '@/shared/constants';

type PageProps = {
  params: Promise<{ id: string }>;
};

// /consult/:id — 공개 동의를 받은 익명 사례 1건 상세.
// consultation_case는 편집자가 새로 쓴 익명화 본문만 갖고, 원문
// (consultation_lead.message)을 참조하지 않는다(api-contract §4.3).
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return { title: SITE_CONFIG.name };

  try {
    const detail = await repository.getCaseDetail(numericId);
    return {
      title: `${detail.question} | ${SITE_CONFIG.name} 상담 사례`,
      description: detail.summary,
    };
  } catch {
    return { title: SITE_CONFIG.name };
  }
}

export default async function ConsultCaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  try {
    const detail = await repository.getCaseDetail(numericId);
    return (
      <div className="mx-auto w-full max-w-reading px-4 py-10 md:px-8">
        <Link
          href={PUBLIC.CONSULT.INDEX}
          className="font-label-normal text-text-sub2 mb-6 inline-block"
        >
          ← 상담소로 돌아가기
        </Link>
        <span className="font-label-normal text-key-color-primary">
          {detail.category}
        </span>
        <h1 className="font-title-heading mt-2 mb-6 text-2xl leading-[135%] tracking-tight lg:text-3xl">
          {detail.question}
        </h1>
        <p className="font-body1-normal text-text-main whitespace-pre-line">
          {detail.body}
        </p>
        <div className="border-line-line1 mt-10 rounded-xl border bg-white p-6 text-center">
          <p className="font-body1-heading mb-2">비슷한 고민이 있나요?</p>
          <Link
            href={PUBLIC.CONSULT.INDEX}
            className="text-key-color-primary font-body2-heading"
          >
            비공개로 고민 남기기 →
          </Link>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}

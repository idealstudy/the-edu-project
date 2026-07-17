'use client';

import Link from 'next/link';

import {
  consultationCaseKeys,
  repository,
} from '@/entities/consultation-lead';
import { PUBLIC } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';

/**
 * 공개 상담 사례 (/consult) — frd-public-portal-v1 §3.4·§4.5.1
 *
 * 이 모듈은 SAMPLE_ALLOWED가 아니다. 0건이어도 예시 데이터로 채우지
 * 않는다("동의받은 답변만 공개"라는 약속이 거짓이 되므로). 오류가 나도
 * 접수 CTA(ConsultForm)는 이 컴포넌트와 무관하게 항상 살아있다.
 */
export function ConsultCases() {
  const { data, isLoading, isError } = useQuery({
    queryKey: consultationCaseKeys.list(0, 10),
    queryFn: () => repository.getCaseList({ page: 0, size: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="border-line-line1 h-[220px] animate-pulse rounded-xl border bg-white" />
    );
  }

  const cases = !isError ? data?.content : undefined;

  if (!cases || cases.length === 0) {
    return (
      <div className="border-line-line1 flex flex-col items-center gap-3 rounded-xl border bg-white px-8 py-12 text-center">
        <p className="font-body1-heading">
          {isError
            ? '사례를 불러오지 못했어요'
            : '아직 공개 동의를 받은 사례가 없습니다'}
        </p>
        <p className="font-body2-normal text-text-sub2">
          첫 질문을 비공개로 남겨주세요. 조성진 선생님이 직접 확인합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cases.map((c) => (
        <Link
          key={c.caseId}
          href={PUBLIC.CONSULT.CASE_DETAIL(c.caseId)}
          className="border-line-line1 flex flex-col gap-2 rounded-xl border bg-white p-6 hover:border-line-line3"
        >
          <span className="font-label-normal text-key-color-primary">
            {c.category}
          </span>
          <p className="font-body1-heading line-clamp-2">{c.question}</p>
          <p className="font-body2-normal text-text-sub2 line-clamp-2">
            {c.summary}
          </p>
        </Link>
      ))}
    </div>
  );
}

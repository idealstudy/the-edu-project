'use client';

import { useTransition } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ConsultationStatus } from '@/entities/consultation';
import MyConsultationItem from '@/features/mypage/consultation/components/my-consultation-item';
import { useReceivedConsultations } from '@/features/mypage/consultation/hooks/use-received-consultations';
import SectionContainer from '@/features/profile/components/section-container';
import { Checkbox, Pagination } from '@/shared/components/ui';

const parsePage = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
};

const isConsultationStatus = (v: string | null): v is ConsultationStatus =>
  v === 'PENDING' || v === 'ANSWERED';

export default function ReceivedConsultationList() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const currentPage = parsePage(searchParams.get('page') ?? undefined);

  const raw = searchParams.get('status');
  const currentStatus = isConsultationStatus(raw) ? raw : undefined;

  const { data, isLoading, isError, refetch } = useReceivedConsultations({
    page: currentPage - 1,
    status: currentStatus,
  });

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  // 상태 변경
  const handleStatusChange = (status: ConsultationStatus | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  return (
    <SectionContainer
      title="받은 문의 목록"
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      {/* 답변 대기만 보기 */}
      <Checkbox.Label className="self-end">
        <Checkbox
          checked={currentStatus === 'PENDING'}
          onCheckedChange={(checked) => {
            handleStatusChange(checked ? 'PENDING' : undefined);
          }}
        />
        <span className="font-label-normal">답변 대기만 보기</span>
      </Checkbox.Label>

      {data && data.content.length > 0 ? (
        <>
          {data.content.map((item) => (
            <MyConsultationItem
              key={item.id}
              item={item}
            />
          ))}
          <Pagination
            className="mt-6 justify-center"
            page={currentPage}
            totalPages={data.totalPages ?? 1}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p className="text-gray-5 py-10 text-center text-sm">
          받은 문의가 없습니다.
        </p>
      )}
    </SectionContainer>
  );
}

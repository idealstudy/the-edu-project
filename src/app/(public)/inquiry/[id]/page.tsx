import { notFound } from 'next/navigation';

import InquiryDetailArea from '@/features/inquiry/components/inquiry-detail-area';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiryId = Number(id);

  if (isNaN(inquiryId)) notFound();

  return <InquiryDetailArea id={inquiryId} />;
}

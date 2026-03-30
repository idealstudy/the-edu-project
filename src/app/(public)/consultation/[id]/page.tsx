import { notFound } from 'next/navigation';

import ConsultationDetailArea from '@/features/consultation/components/consultation-detail-area';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ConsultationDetailPage({ params }: Props) {
  const { id } = await params;
  const consultationId = Number(id);

  if (isNaN(consultationId)) notFound();

  return <ConsultationDetailArea id={consultationId} />;
}

'use client';

import { MoreContentsHeader } from '../more-contents-header';
import { ParentStudent } from '../types/parent-student';
import { ConsultationList } from './study-consultation-list';

export const StudyConsultation = ({ data }: { data: ParentStudent[] }) => {
  return (
    <div className="flex min-h-[calc(100vh-76px)] w-full flex-col">
      <MoreContentsHeader kind="STUDY_CONSULTATION" />
      <ConsultationList data={data} />
    </div>
  );
};

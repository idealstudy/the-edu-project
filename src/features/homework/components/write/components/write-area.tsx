'use client';

import Image from 'next/image';

import SubmitSection from '@/features/dashboard/studynote/write/components/submit-section';
import {
  useTeacherCreateHomework,
  useTeacherUpdateHomework,
} from '@/features/homework/hooks/teacher/useTeacherHomeworkMutations';
import { ColumnLayout } from '@/layout/column-layout';

import { MetaSection } from './meta-section';

type WriteAreaProps = {
  isEditMode?: boolean;
};

export const WriteArea = ({ isEditMode = false }: WriteAreaProps) => {
  // homework
  const { isPending: isCreateHomeworkPending } = useTeacherCreateHomework();
  const { isPending: isUpdateHomeworkPending } = useTeacherUpdateHomework();

  const isPending = isEditMode
    ? isUpdateHomeworkPending
    : isCreateHomeworkPending;

  return (
    <ColumnLayout.Right className="desktop:max-w-[740px] border-line-line1 h-fit w-full rounded-xl border bg-white px-8 py-10">
      <div className="flex w-full justify-between">
        <span>
          <div className="text-key-color-primary font-semibold">
            {isEditMode ? '과제 편집' : '과제 작성'}
          </div>
          <h1 className="mt-2 text-[32px] font-bold">어떤 과제인가요?</h1>
        </span>
        <Image
          src="/studyroom/study-room-write-header.png"
          alt="header-image"
          width={71}
          height={151}
        />
      </div>
      <div className="space-y-8">
        <MetaSection />

        <SubmitSection
          isPending={isPending}
          isEditMode={isEditMode}
        />
      </div>
    </ColumnLayout.Right>
  );
};

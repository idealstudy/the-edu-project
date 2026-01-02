'use client';

import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';

import { useCreateHomework } from '@/features/homework/hooks/teacher/useCreateHomework';
import { useUpdateTeacherHomework } from '@/features/homework/hooks/teacher/useUpdateHomework';
import { useUpdateStudyNote } from '@/features/study-notes/hooks';
import { ColumnLayout } from '@/layout/column-layout';

import { useWriteStudyNoteMutation } from '../services/query';
import MetaSection from './meta-section';
import SubmitSection from './submit-section';
import VisibilitySection from './visiblity-section';

type WriteAreaProps = {
  isEditMode?: boolean;
};

const WriteArea = ({ isEditMode = false }: WriteAreaProps) => {
  const param = useParams();
  const studyRoomId = Number(param.id);
  const homeworkId = Number(param.homeworkId);
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const tab = segments[2] as 'note' | 'homework';

  // note
  const { isPending: isCreateNotePending } = useWriteStudyNoteMutation();
  const { isPending: isUpdateNotePending } = useUpdateStudyNote();

  // homework
  const { isPending: isCreateHomeworkPending } = useCreateHomework(studyRoomId);
  const { isPending: isUpdateHomeworkPending } = useUpdateTeacherHomework(
    studyRoomId,
    homeworkId
  );

  const isPending =
    tab === 'note'
      ? isEditMode
        ? isUpdateNotePending
        : isCreateNotePending
      : isEditMode
        ? isUpdateHomeworkPending
        : isCreateHomeworkPending;

  return (
    <ColumnLayout.Right className="desktop:max-w-[740px] border-line-line1 h-fit w-full rounded-xl border bg-white px-8 py-10">
      <div className="flex w-full justify-between">
        <span>
          <div className="text-key-color-primary font-semibold">
            {tab === 'note'
              ? isEditMode
                ? '수업노트 편집'
                : '수업노트 작성'
              : isEditMode
                ? '과제 편집'
                : '과제 작성'}
          </div>
          <h1 className="mt-2 text-[32px] font-bold">
            {tab === 'note' ? (
              <>
                어떤 수업을 <br />
                진행하셨나요?
              </>
            ) : (
              <>어떤 과제인가요?</>
            )}
          </h1>
        </span>
        <Image
          src="/studyroom/study-room-write-header.png"
          alt="header-image"
          width={71}
          height={151}
        />
      </div>
      <div className="space-y-8">
        <MetaSection tab={tab as 'note' | 'homework'} />
        {tab === 'note' ? (
          <>
            <hr
              style={{
                borderImage:
                  'repeating-linear-gradient(to right, gray 0, gray 4px, transparent 4px, transparent 8px)',
                borderImageSlice: 1,
              }}
            />
            <VisibilitySection />
          </>
        ) : null}

        <SubmitSection
          isPending={isPending}
          isEditMode={isEditMode}
        />
      </div>
    </ColumnLayout.Right>
  );
};
export default WriteArea;

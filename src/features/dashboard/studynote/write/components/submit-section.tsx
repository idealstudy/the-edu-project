'use client';

import { useFormContext } from 'react-hook-form';

import { useUpdateStudyNote } from '@/features/study-notes/hooks';
import { Button } from '@/shared/components/ui/button';

import { StudyNoteForm } from '../schemas/note';
import { useWriteStudyNoteMutation } from '../services/query';

type SubmitSectionProps = {
  isEditMode?: boolean;
};

const SubmitSection = ({ isEditMode = false }: SubmitSectionProps) => {
  const { isPending: isWritePending } = useWriteStudyNoteMutation();
  const { isPending: isUpdatePending } = useUpdateStudyNote();
  const {
    formState: { isValid, isSubmitting, isDirty },
  } = useFormContext<StudyNoteForm>();

  const isPending = isEditMode ? isUpdatePending : isWritePending;

  // 편집 모드일 때는 변경사항이 있을 때만 활성화
  const isButtonDisabled =
    !isValid || isPending || isSubmitting || (isEditMode && !isDirty);

  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        disabled={isButtonDisabled}
        className="w-[200px] rounded-sm"
      >
        {isPending ? '저장 중...' : isEditMode ? '수정하기' : '저장하기'}
      </Button>
    </div>
  );
};

export default SubmitSection;

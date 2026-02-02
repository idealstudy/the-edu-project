'use client';

import {
  type DialogAction,
  type DialogState,
  StudyroomConfirmDialog,
} from '@/shared/components/dialog';
import { useRole } from '@/shared/hooks/use-role';

import { useTeacherRemoveHomework } from '../../hooks/teacher/useTeacherHomeworkMutations';
import { Homework, HomeworkPageable } from '../../model/homework.types';

export const HomeworkDialog = ({
  state,
  dispatch,
  studyRoomId,
  homeworkId,
  onRefresh,
}: {
  state: DialogState;
  dispatch: (action: DialogAction) => void;
  studyRoomId: number;
  homeworkId: number;
  item: Homework;
  pageable: HomeworkPageable;
  keyword: string;
  onRefresh: () => void;
}) => {
  const { role } = useRole();
  const isTeacher = role === 'ROLE_TEACHER';

  const { mutate: removeHomeworkMutate, isError } = useTeacherRemoveHomework();

  if (isError) {
    return <div>Error</div>;
  }

  const handleHomeworkDelete = () => {
    if (!isTeacher) {
      return;
    }

    removeHomeworkMutate(
      {
        studyRoomId,
        homeworkId,
      },
      {
        onSuccess: () => {
          dispatch({ type: 'GO_TO_CONFIRM' });
        },
      }
    );
  };

  if (state.status !== 'open') return null;

  return (
    <>
      {state.scope === 'homework' && state.kind === 'delete' && (
        <StudyroomConfirmDialog
          type="delete"
          open
          dispatch={dispatch}
          onDelete={handleHomeworkDelete}
          title="과제를 삭제하시겠습니까?"
          description="삭제된 과제는 복구할 수 없습니다."
        />
      )}

      {state.scope === 'homework' && state.kind === 'onConfirm' && (
        <StudyroomConfirmDialog
          type="confirm"
          open
          dispatch={dispatch}
          onRefresh={onRefresh}
          description="과제가 삭제되었습니다."
        />
      )}
    </>
  );
};

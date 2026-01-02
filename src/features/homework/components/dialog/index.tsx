'use client';

// TODO : study-rooms 의 컴포넌트 쓰고 있네 나중에 shared 로 옮겨야지 않을까요? - @성진
import { ConfirmDialog } from '@/features/study-rooms/components/common/dialog/confirm-dialog';
import type { DialogAction, DialogState } from '@/shared/components/dialog';
import { useRole } from '@/shared/hooks/use-role';

import { useTeacherRemoveHomework } from '../../hooks/teacher/useTeacherHomeworkMutations';
import { Homework, HomeworkPageable } from '../../model/homework.types';

export const HomeworkDialog = ({
  state,
  dispatch,
  studyRoomId,
  homeworkId,
  // item,
  // pageable,
  // keyword,
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

  const {
    mutate: removeHomeworkMutate,
    isPending,
    isError,
  } = useTeacherRemoveHomework(studyRoomId, homeworkId);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  const handleHomeworkDelete = () => {
    if (!isTeacher) {
      // eslint-disable-next-line no-console
      console.error('권한 없음: 과제는 선생님만 삭제할 수 있습니다.');
      return;
    }

    removeHomeworkMutate(undefined, {
      onSuccess: () => {
        dispatch({ type: 'GO_TO_CONFIRM' });
      },
    });
  };

  if (state.status !== 'open') return null;

  return (
    <>
      {state.scope === 'note' && state.kind === 'delete' && (
        <ConfirmDialog
          type="delete"
          open
          dispatch={dispatch}
          onDelete={handleHomeworkDelete}
          title="과제를 삭제하시겠습니까?"
          description="삭제된 과제는 복구할 수 없습니다."
        />
      )}

      {state.scope === 'note' && state.kind === 'onConfirm' && (
        <ConfirmDialog
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

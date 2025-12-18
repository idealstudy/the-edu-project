'use client';

import { useStudyNoteDetailQuery } from '@/features/dashboard/studynote/detail/service/query';
import {
  useRemoveNoteFromGroup,
  useUpdateStudyNote,
} from '@/features/study-notes/hooks';
import {
  StudyNote,
  StudyNoteGroupPageable,
} from '@/features/study-notes/model';
// TODO : study-rooms 의 컴포넌트 쓰고 있네 나중에 shared 로 옮겨야지 않을까요? - @성진
import { ConfirmDialog } from '@/features/study-rooms/components/common/dialog/confirm-dialog';
import { InputDialog } from '@/features/study-rooms/components/common/dialog/input-dialog';
import type { DialogAction, DialogState } from '@/shared/components/dialog';
import { useRole } from '@/shared/hooks/use-role';

import { GroupMoveDialog } from './group-move-dialog';

export const StudyNotesDialog = ({
  state,
  dispatch,
  studyRoomId,
  item,
  pageable,
  keyword,
  onRefresh,
}: {
  state: DialogState;
  dispatch: (action: DialogAction) => void;
  studyRoomId: number;
  item: StudyNote;
  pageable: StudyNoteGroupPageable;
  keyword: string;
  onRefresh: () => void;
}) => {
  const { role } = useRole();
  const isTeacher = role === 'ROLE_TEACHER';

  // const [error, setError] = useState<string | null>(null);
  const { data, isPending, isError } = useStudyNoteDetailQuery(item.id, {
    enabled: state.status === 'open',
  });

  const { mutate: updateStudyNote, isPending: isUpdating } =
    useUpdateStudyNote();
  const { mutate: removeNoteMutate } = useRemoveNoteFromGroup();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  const handleRename = (name: string) => {
    if (!isTeacher) {
      // eslint-disable-next-line no-console
      console.error('권한 없음: 수업 노트 제목은 선생님만 수정할 수 있습니다.');
      return;
    }

    updateStudyNote(
      {
        teachingNoteId: item.id,
        studyRoomId,
        title: name,
        teachingNoteGroupId: item.groupId ?? null,
        content: data?.content || '',
        visibility: item.visibility,
        taughtAt: item.taughtAt,
        studentIds: data?.studentInfos?.map((student) => student.studentId),
        pageable: pageable,
      },
      {
        onSuccess: () => {
          onRefresh(); // refetch
          dispatch({ type: 'CLOSE' });
        },
      }
      // {
      //   onError: (error) => {
      //     setError(error.message || '이름 중복');
      //   },
      // }
    );
  };

  const handleNoteDelete = () => {
    if (!isTeacher) {
      // eslint-disable-next-line no-console
      console.error('권한 없음: 수업 노트는 선생님만 삭제할 수 있습니다.');
      return;
    }

    removeNoteMutate(
      {
        studyNoteId: item.id,
        studyRoomId,
        pageable: pageable,
        // keyword: keyword,
      },
      {
        onSuccess: () => {
          dispatch({ type: 'GO_TO_CONFIRM' });
        },
        onError: (error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('노트 삭제 실패:', error);
        },
      }
    );
  };

  if (state.status !== 'open') return null;

  return (
    <>
      {state.scope === 'note' && state.kind === 'rename' && (
        <InputDialog
          isOpen={true}
          placeholder={state.payload?.initialTitle || ''}
          onOpenChange={() => dispatch({ type: 'CLOSE' })}
          title="제목 수정하기"
          description="수업노트 제목"
          onSubmit={(name) => handleRename(name)}
          disabled={isUpdating || !isTeacher}
        />
      )}

      {state.scope === 'note' && state.kind === 'group-move' && (
        <GroupMoveDialog
          open
          dispatch={dispatch}
          studyRoomId={studyRoomId}
          studyNoteId={item.id}
          pageable={pageable}
          keyword={keyword}
          onRefresh={onRefresh}
        />
      )}

      {state.scope === 'note' && state.kind === 'delete' && (
        <ConfirmDialog
          type="delete"
          open
          dispatch={dispatch}
          onDelete={handleNoteDelete}
          title="수업 노트를 삭제하시겠습니까?"
          description="삭제된 수업노트는 복구할 수 없습니다."
        />
      )}

      {state.scope === 'note' && state.kind === 'onConfirm' && (
        <ConfirmDialog
          type="confirm"
          open
          dispatch={dispatch}
          description="수업노트가 삭제되었습니다."
        />
      )}
    </>
  );
};

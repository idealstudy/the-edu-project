import { useReducer } from 'react';

import Image from 'next/image';

import { ConfirmDialog } from '@/features/study-rooms/components/common/dialog/confirm-dialog';
import { InputDialog } from '@/features/study-rooms/components/common/dialog/input-dialog';
import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';

import {
  useDeleteQnAContextMutation,
  useUpdateQnAContextMutation,
} from '../../services/query';
import { QnAListItem } from '../../types';

type Props = {
  open: number;
  handleOpen: (id: number) => void;
  item: QnAListItem;
  studyRoomId: number;
};

export default function QuestionDropDown({
  open,
  handleOpen,
  item,
  studyRoomId,
}: Props) {
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);
  const { mutate: updateQnAContext, isPending: isUpdating } =
    useUpdateQnAContextMutation();
  const { mutate: deleteQnAContext, isPending: isDeleting } =
    useDeleteQnAContextMutation();

  const handleRename = (title: string) => {
    updateQnAContext(
      {
        studyRoomId,
        contextId: item.id,
        title,
      },
      {
        onSuccess: () => {
          dispatch({ type: 'CLOSE' });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteQnAContext(
      {
        studyRoomId,
        contextId: item.id,
      },
      {
        onSuccess: () => {
          dispatch({ type: 'GO_TO_CONFIRM' });
        },
      }
    );
  };

  return (
    <>
      {dialog.status === 'open' && dialog.scope === 'qna' && (
        <>
          {dialog.kind === 'rename' && (
            <InputDialog
              isOpen={true}
              placeholder={dialog.payload?.initialTitle || ''}
              onOpenChange={() => dispatch({ type: 'CLOSE' })}
              title="질문 제목 수정하기"
              description="질문 제목"
              onSubmit={handleRename}
              disabled={isUpdating}
            />
          )}

          {dialog.kind === 'delete' && (
            <ConfirmDialog
              type="delete"
              open={true}
              dispatch={dispatch}
              onDelete={handleDelete}
              title="질문을 삭제하시겠습니까?"
              description="삭제된 질문은 복구할 수 없습니다."
            />
          )}

          {dialog.kind === 'onConfirm' && (
            <ConfirmDialog
              type="confirm"
              open={true}
              dispatch={dispatch}
              description="질문이 삭제되었습니다."
            />
          )}
        </>
      )}
      <DropdownMenu
        open={open === item.id}
        onOpenChange={() => handleOpen(item.id)}
      >
        <DropdownMenu.Trigger asChild>
          <Image
            src="/studynotes/gray-kebab.svg"
            width={24}
            height={24}
            alt="study-notes"
            className="cursor-pointer"
            onClick={() => handleOpen(item.id)}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-[110px] justify-center">
          <DropdownMenu.Item
            onClick={() => {
              dispatch({
                type: 'OPEN',
                scope: 'qna',
                kind: 'rename',
                payload: {
                  initialTitle: item.title,
                },
              });
            }}
            className="justify-center"
            disabled={isUpdating || isDeleting}
          >
            <p>{isUpdating ? '수정 중...' : '수정하기'}</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            variant="danger"
            className="justify-center"
            onClick={() => {
              dispatch({
                type: 'OPEN',
                scope: 'qna',
                kind: 'delete',
              });
            }}
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제하기'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
}

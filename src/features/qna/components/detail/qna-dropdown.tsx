import { useReducer } from 'react';

import Image from 'next/image';

import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';

import { QnAListItem } from '../../types';

type Props = {
  open: number;
  handleOpen: (id: number) => void;
  item: QnAListItem;
};

export default function QuestionDropDown({ open, handleOpen, item }: Props) {
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);

  const handleDelete = () => {
    // TODO: 수업노트 삭제 API 호출 후 상태 업데이트 로직 넣기
    dispatch({
      type: 'OPEN',
      scope: 'note',
      kind: 'delete',
      payload: {
        noteId: item.id,
      },
    });
  };

  return (
    <>
      {dialog.status === 'open' && <div />}
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
                scope: 'note',
                kind: 'rename',
                payload: {
                  initialTitle: item.title,
                },
              });
            }}
            className="justify-center"
          >
            <p>수정하기</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            variant="danger"
            className="justify-center"
            onClick={() => handleDelete()}
          >
            삭제하기
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
}

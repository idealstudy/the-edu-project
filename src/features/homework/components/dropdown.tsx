import { useReducer } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';

import { Homework, HomeworkPageable } from '../model/homework.types';
import { HomeworkDialog } from './dialog';

export const HomeworkDropdown = ({
  studyRoomId,
  homeworkId,
  open,
  handleOpen,
  item,
  pageable,
  keyword,
  onRefresh,
}: {
  studyRoomId: number;
  homeworkId: number;
  open: number;
  handleOpen: (id: number) => void;
  item: Homework;
  pageable: HomeworkPageable;
  keyword: string;
  onRefresh: () => void;
}) => {
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);
  const handleDelete = () => {
    // TODO: 수업노트 삭제 API 호출 후 상태 업데이트 로직 넣기
    dispatch({
      type: 'OPEN',
      scope: 'homework',
      kind: 'delete',
      payload: {
        homeworkId: item.id,
      },
    });
  };

  return (
    <>
      {dialog.status === 'open' && (
        <HomeworkDialog
          state={dialog}
          dispatch={dispatch}
          onRefresh={onRefresh}
          studyRoomId={studyRoomId}
          homeworkId={homeworkId}
          pageable={pageable}
          keyword={keyword}
          item={item}
        />
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
            className="hover:bg-gray-scale-gray-5 cursor-pointer rounded" // 3단 점을 누르는건지 수업노트를 누르는건지 구분 필요
            onClick={() => handleOpen(item.id)}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-[110px] justify-center">
          <DropdownMenu.Item asChild>
            <Link
              href={`/study-rooms/${studyRoomId}/homework/${item.id}/edit`}
              className="justify-center border-none focus:ring-0 focus:outline-none"
            >
              수정하기
            </Link>
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
};

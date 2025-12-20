'use client';

import { Dispatch, SetStateAction, useReducer, useState } from 'react';

import Image from 'next/image';

import { InputDialog } from '@/features/study-rooms/components/common/dialog/input-dialog';
import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { DropdownMenu } from '@/shared/components/ui';

type Props = {
  isOwner: boolean;
  user: { name: string };
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
};

export function ProfileCardDropdown({ isOwner, user, setIsEditMode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);

  // const handleRename = (name: string) => {
  // console.log(name);
  // };

  return (
    <>
      {dialog.status === 'open' && (
        <InputDialog
          isOpen={true}
          placeholder={user.name || ''}
          onOpenChange={() => dispatch({ type: 'CLOSE' })}
          title="이름 변경하기"
          onSubmit={
            () => {}
            // (name) => handleRename(name)
          }
          // disabled={isUpdating || !isOwner}
        />
      )}

      <DropdownMenu
        open={isOpen}
        onOpenChange={() => setIsOpen((prev) => !prev)}
      >
        <DropdownMenu.Trigger>
          <Image
            src="/studynotes/gray-kebab.svg"
            width={24}
            height={24}
            alt="dropdown-icon"
            className="cursor-pointer"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-[110px] justify-center">
          <DropdownMenu.Item className="justify-center">
            <p>공유하기</p>
          </DropdownMenu.Item>
          {isOwner && (
            <>
              <DropdownMenu.Item
                onClick={() => setIsEditMode((state) => !state)}
                className="justify-center"
              >
                수정하기
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onClick={() => {
                  dispatch({
                    type: 'OPEN',
                    scope: 'note',
                    kind: 'rename',
                    payload: {
                      initialTitle: user.name,
                    },
                  });
                }}
                className="justify-center"
              >
                <p className="text-nowrap">이름 변경하기</p>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
}

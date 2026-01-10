'use client';

import { Dispatch } from 'react';

import Image from 'next/image';

import { DialogAction } from '@/shared/components/dialog';
import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';

export const StudyroomSidebarHeader = ({
  dispatch,
  studyRoomName,
  teacherName,
  canManage,
}: {
  dispatch: Dispatch<DialogAction>;
  studyRoomName?: string;
  teacherName?: string;
  canManage: boolean;
}) => {
  return (
    <>
      <div>
        <div className="flex h-12 items-center justify-between">
          <p className="desktop:max-w-[260px] truncate text-[28px] leading-tight font-bold">
            {studyRoomName || '스터디룸'}
          </p>
          {canManage && (
            <DropdownMenu>
              <DropdownMenu.Trigger className="flex cursor-pointer items-center justify-center">
                <Image
                  src="/studyroom/ic-kebab.png"
                  alt="kebab-menu"
                  width={48}
                  height={48}
                  className="cursor-pointer self-start rounded-[8px] border-none p-1 hover:bg-gray-100"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() =>
                    dispatch({
                      type: 'OPEN',
                      scope: 'studyroom',
                      kind: 'rename',
                    })
                  }
                >
                  편집하기
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  variant="danger"
                  onClick={() =>
                    dispatch({
                      type: 'OPEN',
                      scope: 'studyroom',
                      kind: 'delete',
                    })
                  }
                >
                  삭제하기
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
        </div>
        {!canManage && <p>{teacherName} 선생님</p>}
      </div>
      <Image
        src="/studyroom/profile.svg"
        alt="study-room-profile"
        className="bg-orange-scale-orange-1 rounded-[12px] p-[14px]"
        width={300}
        height={300}
      />
    </>
  );
};

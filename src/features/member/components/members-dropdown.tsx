'use client';

import Image from 'next/image';

import {
  useRemoveMember,
  useTerminateMember,
} from '@/features/study-rooms/hooks';
import { DropdownMenu } from '@/shared/components/ui';

type Props = {
  studyRoomId: number;
  memberId: string;
};

export default function MembersDropdown({ studyRoomId, memberId }: Props) {
  const { mutate: removeMember } = useRemoveMember();
  const { mutate: terminateMember } = useTerminateMember();

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Image
            src="/studynotes/gray-kebab.svg"
            width={28}
            height={28}
            alt="더보기"
            className="h-7 w-7 cursor-pointer"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item
            onSelect={() =>
              removeMember({ studyRoomId, studentId: Number(memberId) })
            }
          >
            학생 내보내기
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() =>
              terminateMember({ studyRoomId, studentId: Number(memberId) })
            }
          >
            수업 종료하기
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
}

'use client';

import React from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useSendInvitation } from '@/features/study-rooms';
import { InvitationField } from '@/features/study-rooms/components/student-invitation/InvitationField';
import { useInvitationController } from '@/features/study-rooms/hooks/useInvitationController';

export const InvitationDialog = ({
  isOpen,
  placeholder,
  onOpenChange,
  title,
  error,
  studyRoomId,
}: {
  isOpen: boolean;
  placeholder: string;
  onOpenChange: () => void;
  title: string;
  error?: string;
  studyRoomId: number;
}) => {
  const invitation = useInvitationController(studyRoomId);
  const { mutate: sendInvitation, isPending } = useSendInvitation();

  const handleSubmit = () => {
    const emails = Array.from(invitation.invitees.keys());
    if (!emails.length) return;
    sendInvitation({ studyRoomId, emails });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content className="w-[798px]">
        <Dialog.Header>
          <Dialog.Title className="text-3xl">{title}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body className="mt-6">
          <Dialog.Description className="sr-only">
            초대할 사용자를 검색하고 초대할 수 있는 다이얼로그입니다.
          </Dialog.Description>
          <InvitationField
            invitation={invitation}
            placeholder={placeholder}
          />
          <aside
            role="note"
            aria-labelledby="invitation-info-title"
            className="flex items-start gap-2"
          >
            <Image
              src="/common/info.svg"
              alt="alert"
              width={20}
              height={20}
              className="relative top-[3px]"
            />
            <h2
              id="invitation-info-title"
              className="sr-only"
            >
              사용자(학생)초대 관련 안내
            </h2>
            <ul className="space-y-1">
              <li>학생을 초대하면 연결된 보호자는 자동으로 함께 입장합니다.</li>
              <li>
                각 수업 노트는 보호자에게 공개하거나 비공개로 설정할 수
                있습니다.
              </li>
              <li>
                학생과 연결되지 않은 보호자는 스터디룸에 입장할 수 없습니다.
              </li>
            </ul>
          </aside>
        </Dialog.Body>
        <Dialog.Footer className="mt-6 justify-end">
          <Dialog.Close asChild>
            <Button
              className="w-[140px]"
              disabled={!invitation.invitees.size || !!error || isPending}
              onClick={handleSubmit}
            >
              {isPending ? '초대 중…' : '초대하기'}
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

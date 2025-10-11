'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { InvitationSearchResult } from '@/features/studyrooms/components/student-invitation/InvitationSearchResult';
import { useInvitationController } from '@/features/studyrooms/hooks/useInvitationController';

/*type Invitee = {
  role: 'ROLE_STUDENT' | 'ROLE_PARENT';
  canInvite: boolean;
  inviteeId: number;
  inviteeEmail: string;
  inviteeName: string;
  connectedGuardianCount: number;
  connectedStudentCount: number;
  studentResponseList: string[];
};

const mockInvitee: Invitee = {
  role: 'ROLE_STUDENT',
  canInvite: true,
  inviteeId: 1001,
  inviteeEmail: 'student@dedu.com',
  inviteeName: '김은지',
  connectedGuardianCount: 1,
  connectedStudentCount: 0,
  studentResponseList: ['PENDING'],
};*/

export const InvitationDialog = ({
  isOpen,
  placeholder,
  onOpenChange,
  title,
}: {
  isOpen: boolean;
  placeholder: string;
  onOpenChange: () => void;
  title: string;
}) => {
  const invitation = useInvitationController();
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
          <Button
            variant="outlined"
            className="text-text-sub2 border-line-line2 hover:border-key-color-primary mb-4 justify-start rounded-lg hover:bg-transparent active:bg-transparent"
            onClick={invitation.toggle}
          >
            {placeholder}
          </Button>
          {/*<InvitationNotice/>*/}
          <InvitationSearchResult invitation={invitation} />
        </Dialog.Body>
        {/*<InvitationChip name='김은지' guardianCount={1} onRemove={() => {}}/>*/}
        <Dialog.Footer className="mt-6 justify-end">
          <Dialog.Close asChild>
            <Button
              className="w-[140px]"
              //disabled={!name.trim() || !!error}
              onClick={invitation.submit}
            >
              초대하기
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

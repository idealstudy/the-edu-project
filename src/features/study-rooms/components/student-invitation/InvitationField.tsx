'use client';

import React from 'react';

import { InvitationChip } from '@/features/study-rooms/components/student-invitation/InvitationChip';
import { InvitationSearchResult } from '@/features/study-rooms/components/student-invitation/InvitationSearchResult';
import { InvitationController } from '@/features/study-rooms/hooks/useInvitationController';

import { Popover } from './Popover';

export const InvitationField = ({
  invitation,
  placeholder,
  labelledById,
}: {
  invitation: InvitationController;
  placeholder: string;
  labelledById?: string;
}) => {
  return (
    /* Todo: 버튼 내 버튼 중복 콘솔 오류로 임시 child 지정 */
    <Popover>
      <Popover.Trigger asChild>
        <div
          role="combobox"
          tabIndex={0}
          aria-labelledby={labelledById}
          aria-expanded={invitation.isSearch}
          aria-controls="invitation-popover"
          onClick={invitation.openSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              invitation.openSearch();
            }
            if (
              (e.key === 'Backspace' || e.key === 'Delete') &&
              !invitation.isSearch &&
              invitation.searchQuery.trim() === '' &&
              invitation.invitees.size > 0
            ) {
              e.preventDefault();
              invitation.removeLast();
            }
          }}
          className="text-text-sub2 border-line-line2 hover:border-key-color-primary focus-visible:ring-key-color-primary mb-4 flex min-h-12 cursor-pointer flex-wrap items-center justify-start gap-2 rounded-[4px] border px-3 py-2 hover:bg-transparent focus:outline-none focus-visible:ring-2 active:bg-transparent"
        >
          {invitation.invitees.size === 0 && (
            <span
              className="text-gray-500"
              aria-hidden="true"
            >
              {placeholder}
            </span>
          )}
          <ul
            role="list"
            aria-label="초대 대상 목록"
            className="flex min-h-12 flex-wrap gap-2"
          >
            {Array.from(invitation.invitees.values()).map((u) => (
              <InvitationChip
                key={u.inviteeEmail}
                name={u.inviteeName}
                email={u.inviteeEmail}
                guardianCount={u.connectedGuardianCount ?? 0}
                onRemove={() => invitation.removeUser(u.inviteeEmail)}
              />
            ))}
          </ul>
        </div>
      </Popover.Trigger>
      <Popover.Content>
        <InvitationSearchResult invitation={invitation} />
      </Popover.Content>
    </Popover>
  );
};

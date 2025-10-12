import React from 'react';

import { InvitationChip } from '@/features/studyrooms/components/student-invitation/InvitationChip';
import { InvitationSearchResult } from '@/features/studyrooms/components/student-invitation/InvitationSearchResult';
import { InvitationController } from '@/features/studyrooms/hooks/useInvitationController';

export const InvitationField = ({
  invitation,
  placeholder,
}: {
  invitation: InvitationController;
  placeholder: string;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={invitation.isSearch}
        aria-controls="invitation-search-panel"
        onClick={() => {
          invitation.toggle();
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            invitation.toggle();
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
        className="text-text-sub2 border-line-line2 hover:border-key-color-primary focus-visible:ring-key-color-primary mb-4 flex min-h-12 flex-wrap items-center justify-start gap-2 rounded-lg border px-3 py-2 hover:bg-transparent focus:outline-none focus-visible:ring-2 active:bg-transparent"
      >
        {/* placeholder (칩 없을 때만) */}
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
              key={u.email}
              name={u.name}
              guardianCount={Number(u.guardian?.match(/\d+/)?.[0] ?? 0)}
              onRemove={() => invitation.removeUser(/* u */)}
            />
          ))}
        </ul>
      </div>
      {invitation.isSearch && (
        <InvitationSearchResult invitation={invitation} />
      )}
    </>
  );
};

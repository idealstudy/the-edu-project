'use client';

import React from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { InvitationController } from '@/features/study-rooms/hooks/useInvitationController';

export const InvitationSearchResult = ({
  invitation,
}: {
  invitation: InvitationController;
}) => {
  return (
    <div
      id="invitation-search-panel"
      role="region"
      aria-labelledby="invitation-search-heading"
      className="w-full space-y-3 p-5"
    >
      <h3
        id="invitation-search-heading"
        className="sr-only"
      >
        초대 대상 검색
      </h3>
      <TextField>
        <TextField.Label className="sr-only">
          초대 대상 이메일 검색
        </TextField.Label>
        <TextField.Input
          autoFocus
          value={invitation.searchQuery}
          onChange={(e) => invitation.setSearchQuery(e.target.value)}
          placeholder="초대할 사람의 이메일을 입력하세요."
          aria-label="초대 대상 이메일 검색"
          aria-controls="invitation-results"
          aria-expanded={!!invitation.searchResult}
          aria-autocomplete="list"
          aria-describedby="invite-hint invite-error"
          aria-invalid="false"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              invitation.search(e.currentTarget.value.trim());
            }
            if (
              e.key === 'Backspace' &&
              !invitation.searchQuery &&
              invitation.invitees.size
            ) {
              e.preventDefault();
              invitation.removeLast();
            }
            if (e.key === 'Escape') {
              invitation.closeSearch();
            }
          }}
        />
      </TextField>

      <div
        id="invitation-results"
        role="listbox"
        aria-label="검색 결과"
      >
        {invitation.searchResult && (
          <Button
            onClick={invitation.addUser}
            role="option"
            aria-selected="false"
            aria-describedby="invitation-result-0"
            aria-label={`${invitation.searchResult?.inviteeName}, ${invitation.searchResult?.role}, ${invitation.searchResult?.connectedGuardianCount} — ${
              invitation.searchResult?.canInvite ? '초대 가능' : '이미 초대됨'
            }. 초대하기`}
            variant="outlined"
            className="hover:border-key-color-primary flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-transparent active:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <Image
                src={'/img_header_profile.svg'}
                alt="프로필 사진"
                width={48}
                height={48}
                className="rounded-full"
              />

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {invitation.searchResult?.inviteeName}
                </span>
                <span className="rounded-md border border-gray-300 px-1.5 py-[1px] text-sm text-gray-700">
                  {invitation.searchResult?.role}
                </span>
                <span
                  className="text-key-color-primary text-[10px] leading-[0]"
                  aria-hidden="true"
                >
                  ●
                </span>
                <span className="text-system-warning text-sm">
                  보호자 {invitation.searchResult?.connectedGuardianCount}
                </span>
              </div>
            </div>

            <p
              id="invitation-result-0-status"
              className="text-md font-semibold text-gray-500"
            >
              {invitation.searchResult?.canInvite ? '초대 가능' : '이미 초대됨'}
            </p>
          </Button>
        )}
      </div>
    </div>
  );
};

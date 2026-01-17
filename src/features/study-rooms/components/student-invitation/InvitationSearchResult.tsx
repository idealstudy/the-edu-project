'use client';

import React from 'react';

import Image from 'next/image';

import { InvitationController } from '@/features/study-rooms/hooks/useInvitationController';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/text-field';

export const InvitationSearchResult = ({
  invitation,
}: {
  invitation: InvitationController;
}) => {
  const studentResults =
    invitation.searchResult?.filter((user) => user.role === 'ROLE_STUDENT') ||
    [];
  const hasResults = studentResults?.length > 0;

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
      <TextField className="flex justify-between">
        <TextField.Label className="sr-only">
          초대 대상 이름 또는 이메일 검색
        </TextField.Label>
        <TextField.Input
          autoFocus
          value={invitation.searchQuery}
          onChange={(e) => invitation.setSearchQuery(e.target.value)}
          placeholder="이름 또는 이메일 입력 후 Enter 키를 눌러 검색하세요."
          aria-label="초대 대상 이름 또는 이메일 검색"
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
        <span className="place-self-center">↵</span>
      </TextField>

      <div
        id="invitation-results"
        role="listbox"
        aria-label="검색 결과"
      >
        {invitation.searchResult !== null &&
          (hasResults
            ? studentResults.map((user) => (
                <Button
                  key={user.inviteeId}
                  onClick={() => invitation.addUser(user)}
                  role="option"
                  aria-selected="false"
                  aria-describedby="invitation-result-0"
                  aria-label={`${user.inviteeName}, ${user.role}, ${user.connectedGuardianCount} — ${
                    user.canInvite ? '초대 가능' : '초대 완료'
                  }. 초대하기`}
                  variant="outlined"
                  className="hover:border-key-color-primary flex h-fit w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-3 hover:bg-transparent active:bg-transparent"
                  disabled={!user.canInvite}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={'/img_header_profile.svg'}
                      alt="프로필 사진"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {user.inviteeName}
                        </span>
                        <span className="rounded-md border border-gray-300 px-1.5 py-[1px] text-sm text-gray-700">
                          {user.role === 'ROLE_STUDENT' && '학생'}
                        </span>
                        <span
                          className="text-key-color-primary text-[10px] leading-[0]"
                          aria-hidden="true"
                        >
                          ●
                        </span>
                        <span className="text-system-warning text-sm">
                          보호자 {user.connectedGuardianCount}
                        </span>
                      </div>
                      <p className="text-text-sub2 text-start">
                        {user.inviteeEmail}
                      </p>
                    </div>
                  </div>

                  <p
                    id="invitation-result-0-status"
                    className="text-md font-semibold text-gray-500"
                  >
                    {user.canInvite ? '초대 가능' : '초대 완료'}
                  </p>
                </Button>
              ))
            : invitation.searchQuery.trim().length > 0 && (
                <div className="flex w-full items-center justify-center py-6 text-sm text-gray-500">
                  검색 결과가 없습니다.
                </div>
              ))}
      </div>
    </div>
  );
};

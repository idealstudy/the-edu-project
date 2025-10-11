'use client';

import React from 'react';

import Image from 'next/image';

import { TextField } from '@/components/ui/text-field';
import { InvitationController } from '@/features/studyrooms/hooks/useInvitationController';

export const InvitationSearchResult = ({
  invitation,
}: {
  invitation: InvitationController;
}) => {
  return (
    <div className="border-line-line2 w-full space-y-3 rounded-lg border-2 p-5">
      {/* 검색 입력창 */}
      <TextField>
        <TextField.Input
          value={invitation.searchQuery}
          onChange={invitation.change}
          placeholder="초대할 사람의 이메일을 입력하세요."
          onKeyDown={invitation.keyDown}
        />
      </TextField>

      {/* 검색 결과 */}
      {invitation.searchResult && (
        <div className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src={'/img_header_profile.svg'}
              alt="프로필 사진"
              width={48}
              height={48}
              className="rounded-full"
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">
                  {invitation.searchResult?.name}
                </p>
                <span className="rounded-md border border-gray-300 px-1.5 py-[1px] text-xs text-gray-700">
                  {invitation.searchResult?.role}
                </span>
                <span className="text-system-warning text-[13px]">
                  {invitation.searchResult?.guardian}
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽 영역: 초대 버튼 or 상태 */}
          <p className="text-md font-semibold text-gray-500">
            {invitation.searchResult?.status === 'invite'
              ? '초대 가능'
              : '이미 초대됨'}
          </p>
        </div>
      )}
    </div>
  );
};

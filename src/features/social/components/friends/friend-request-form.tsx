'use client';

import { useState } from 'react';

import { Button, Input } from '@/shared/components/ui';

import { useRequestFriendMutation } from '../../hooks';

/* ─────────────────────────────────────────────────────
 * 친구 요청 폼 — 상대 회원 ID 로 요청 전송.
 *  (백엔드가 회원 검색 API 를 제공하지 않아 ID 기반 입력)
 * ────────────────────────────────────────────────────*/
export const FriendRequestForm = () => {
  const [value, setValue] = useState('');
  const { mutate, isPending } = useRequestFriendMutation();

  const parsedId = Number(value);
  const isValid = value.trim().length > 0 && Number.isInteger(parsedId) && parsedId > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || isPending) return;
    mutate(
      { addresseeId: parsedId },
      { onSuccess: () => setValue('') }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-line-line2 flex flex-col gap-3 rounded-[12px] border bg-white p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-body1-heading text-text-main">친구 요청 보내기</h2>
        <p className="font-caption-normal text-text-sub2">
          함께 도전할 친구의 회원 번호를 입력해 요청을 보내요.
        </p>
      </div>
      <div className="flex items-stretch gap-2">
        <Input
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, ''))}
          placeholder="상대 회원 번호"
          aria-label="친구 요청 대상 회원 번호"
          className="flex-1"
        />
        <Button
          type="submit"
          size="small"
          disabled={!isValid || isPending}
          className="shrink-0"
        >
          {isPending ? '전송 중…' : '요청'}
        </Button>
      </div>
    </form>
  );
};

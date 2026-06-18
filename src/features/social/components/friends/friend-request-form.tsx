'use client';

import { useEffect, useState } from 'react';

import { type MemberSearchResult } from '@/entities/social';
import { Button, Input, SearchInput } from '@/shared/components/ui';
import { Loader2, UserPlus } from 'lucide-react';

import {
  useRequestFriendByPhoneMutation,
  useRequestFriendMutation,
  useSearchMembersQuery,
} from '../../hooks';

/* ─────────────────────────────────────────────────────
 * 친구 요청 폼 — 이름/닉네임으로 검색 → 결과에서 친구 요청.
 *  - 디바운스 검색 + 4상태(빈/로딩/없음/결과)
 *  - 회원 번호 직접 입력은 폴백으로 유지.
 * ────────────────────────────────────────────────────*/
export const FriendRequestForm = () => {
  const [keyword, setKeyword] = useState('');
  const [debounced, setDebounced] = useState('');
  const { mutate, isPending } = useRequestFriendMutation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(keyword.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const {
    data: results,
    isFetching,
  } = useSearchMembersQuery(debounced, {
    enabled: debounced.length > 0,
  });

  const handleRequest = (memberId: number) => {
    if (isPending) return;
    mutate({ addresseeId: memberId });
  };

  return (
    <div className="border-line-line2 flex flex-col gap-4 rounded-[12px] border bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-body1-heading text-text-main">친구 찾기</h2>
        <p className="font-caption-normal text-text-sub2">
          함께 도전할 친구를 이름이나 닉네임으로 검색해 요청을 보내요.
        </p>
      </div>

      <SearchInput
        value={keyword}
        onChange={setKeyword}
        placeholder="이름 또는 닉네임으로 검색"
        aria-label="친구 검색"
        className="w-full"
      />

      {/* 검색 결과 4상태 */}
      {debounced.length > 0 && (
        <div className="flex flex-col gap-2">
          {isFetching ? (
            <div className="text-text-sub2 flex items-center justify-center gap-2 py-6">
              <Loader2
                size={18}
                className="animate-spin"
              />
              <span className="font-caption-normal">검색 중이에요…</span>
            </div>
          ) : !results || results.length === 0 ? (
            <p className="font-caption-normal text-text-sub2 py-6 text-center">
              검색 결과가 없어요. 다른 이름으로 찾아보세요.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((member) => (
                <MemberRow
                  key={member.memberId}
                  member={member}
                  disabled={isPending}
                  onRequest={() => handleRequest(member.memberId)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <PhoneNumberFallback />
    </div>
  );
};

const MemberRow = ({
  member,
  disabled,
  onRequest,
}: {
  member: MemberSearchResult;
  disabled: boolean;
  onRequest: () => void;
}) => (
  <li className="border-line-line2 flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <span className="bg-orange-1 text-key-color-primary flex size-10 shrink-0 items-center justify-center rounded-full">
        <UserPlus size={18} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="font-body2-heading text-text-main truncate">
          {member.name}
        </span>
        <span className="font-caption-normal text-text-sub2 truncate">
          {member.nickname ?? `회원 #${member.memberId}`}
        </span>
      </div>
    </div>
    <Button
      size="xsmall"
      disabled={disabled}
      onClick={onRequest}
      className="shrink-0"
    >
      친구 요청
    </Button>
  </li>
);

/* 전화번호로 친구 추가 (검색이 안 될 때) — 숫자/하이픈을 String 으로 유지해 앞 0 보존 */
const PhoneNumberFallback = () => {
  const [value, setValue] = useState('');
  const { mutate, isPending } = useRequestFriendByPhoneMutation();
  // 하이픈 제거한 순수 숫자 — 휴대폰 번호는 보통 10~11자리.
  const digits = value.replace(/[^0-9]/g, '');
  const isValid = digits.length >= 9 && digits.length <= 11;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || isPending) return;
    mutate(
      { phoneNumber: digits },
      { onSuccess: () => setValue('') }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-line-line2 flex flex-col gap-2 border-t pt-4"
    >
      <span className="font-caption-normal text-text-sub2">
        전화번호로 친구를 추가할 수 있어요.
      </span>
      <div className="flex items-stretch gap-2">
        <Input
          inputMode="tel"
          value={value}
          onChange={(event) =>
            setValue(event.target.value.replace(/[^0-9-]/g, ''))
          }
          placeholder="상대 전화번호 (예: 010-1234-5678)"
          aria-label="친구 요청 대상 전화번호"
          className="flex-1"
        />
        <Button
          type="submit"
          variant="outlined"
          size="small"
          disabled={!isValid || isPending}
          className="shrink-0"
        >
          요청
        </Button>
      </div>
    </form>
  );
};

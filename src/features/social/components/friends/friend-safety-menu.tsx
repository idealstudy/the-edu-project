'use client';

import { useState } from 'react';

import {
  useBlockFriendMutation,
  useReportFriendMutation,
  useUnblockFriendMutation,
} from '@/features/social/hooks';
import { Button, Dialog, RadioGroup, Textarea } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { getApiError } from '@/shared/lib/get-api-error';
import { Flag, MoreVertical, ShieldOff } from 'lucide-react';

/**
 * 친구 상세 화면의 차단·신고 메뉴 (F-18, design-spec S51·S55).
 * - 차단·해제는 멱등이라 낙관적 상태 없이 서버 응답을 그대로 반영한다.
 * - 신고 사유는 서버 enum과 1:1(api-contract §4.11). 서버가 유일한 진실원이라
 *   클라이언트는 자격(친구·과거 대결) 여부를 재검사하지 않고 403을 그대로 안내한다.
 */
const REPORT_REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'HARASSMENT', label: '괴롭힘·모욕' },
  { value: 'INAPPROPRIATE_PROFILE', label: '부적절한 프로필' },
  { value: 'CHEATING_OR_FRAUD', label: '부정행위·사기' },
  { value: 'SPAM', label: '스팸' },
  { value: 'OTHER', label: '기타' },
];

type FriendSafetyMenuProps = {
  friendId: number;
  friendName: string;
  isBlocked?: boolean;
};

export const FriendSafetyMenu = ({
  friendId,
  friendName,
  isBlocked = false,
}: FriendSafetyMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const blockFriend = useBlockFriendMutation();
  const unblockFriend = useUnblockFriendMutation();

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="xsmall"
        aria-label="차단·신고 메뉴 열기"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        // 승인 시안 v4 §5-2 는 안전 조작을 아이콘이 아니라 "차단·신고" 글자 버튼으로 둔다.
        // 괴롭힘 상황에서 차단을 찾는 단계를 하나 줄이는 것이 이 버튼의 목적이라,
        // 점 세 개 아이콘 뒤에 숨기면 결정 취지가 사라진다(회장 2026-08-17 "시안대로 해").
        className="hover:bg-gray-1 text-gray-6 flex h-9 items-center justify-center gap-1 rounded-lg px-2.5 text-sm whitespace-nowrap"
      >
        <MoreVertical
          size={16}
          aria-hidden
        />
        차단·신고
      </Button>

      {menuOpen && (
        <div
          className="border-line-line1 shadow-popover absolute top-11 right-0 z-20 w-58 rounded-xl border bg-white p-2 sm:w-58"
          data-testid="friend-safety-menu"
        >
          <Button
            type="button"
            variant="ghost"
            size="xsmall"
            disabled={blockFriend.isPending || unblockFriend.isPending}
            onClick={() => {
              setMenuOpen(false);
              if (isBlocked) {
                unblockFriend.mutate(friendId);
              } else {
                blockFriend.mutate(friendId);
              }
            }}
            className="w-full justify-start gap-2"
          >
            <ShieldOff size={14} />
            {isBlocked ? '차단 해제하기' : `${friendName}님 차단하기`}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xsmall"
            onClick={() => {
              setMenuOpen(false);
              setIsReportOpen(true);
            }}
            className="text-system-warning-text hover:bg-gray-1 w-full justify-start gap-2"
          >
            <Flag size={14} />
            신고하기
          </Button>
        </div>
      )}

      <ReportFriendDialog
        friendId={friendId}
        friendName={friendName}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

const ReportFriendDialog = ({
  friendId,
  friendName,
  isOpen,
  onClose,
}: {
  friendId: number;
  friendName: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [reason, setReason] = useState('HARASSMENT');
  const [detail, setDetail] = useState('');
  const reportFriend = useReportFriendMutation();
  const isOtherReason = reason === 'OTHER';
  const detailTooLong = detail.trim().length > 500;
  const detailMissingForOther = isOtherReason && detail.trim().length === 0;

  const handleClose = () => {
    reportFriend.reset();
    onClose();
  };

  const apiError = getApiError(reportFriend.error);

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(nextIsOpen) => {
        if (!nextIsOpen) handleClose();
      }}
    >
      <Dialog.Content className="w-full max-w-110 gap-5 p-6 sm:p-7">
        <Dialog.Header>
          <Dialog.Title className="text-text-main text-lg font-bold">
            {friendName}님 신고하기
          </Dialog.Title>
          <Dialog.Description className="text-gray-8 mt-1 text-sm">
            신고 내용은 운영팀이 검토해요. 허위 신고는 계정 제재 대상이 될 수
            있어요.
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Body className="gap-4">
          <RadioGroup
            value={reason}
            onValueChange={setReason}
            className="flex flex-col gap-2"
          >
            {REPORT_REASON_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'border-line-line2 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  reason === option.value && 'border-orange-7 bg-orange-1'
                )}
              >
                <RadioGroup.Item value={option.value} />
                {option.label}
              </label>
            ))}
          </RadioGroup>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="report-detail"
              className="text-text-main text-sm font-semibold"
            >
              상세 내용{isOtherReason ? ' (필수)' : ' (선택)'}
            </label>
            <Textarea
              id="report-detail"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="무슨 일이 있었는지 알려주세요."
              maxLength={500}
            />
            {detailTooLong && (
              <p className="text-system-warning-text text-xs">
                500자 이내로 적어주세요.
              </p>
            )}
          </div>

          {apiError && (
            <p
              className="text-system-warning-text text-sm"
              role="alert"
            >
              {apiError.code === 'MEMBER_REPORT_RATE_LIMITED'
                ? '신고를 너무 많이 접수했어요. 1시간 뒤 다시 시도해 주세요.'
                : apiError.code === 'MEMBER_REPORT_CONTEXT_REQUIRED'
                  ? '친구이거나 대결한 적이 있는 상대만 신고할 수 있어요.'
                  : (apiError.message ?? '신고 접수에 실패했어요.')}
            </p>
          )}
        </Dialog.Body>

        <Dialog.Footer className="flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outlined"
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={
              reportFriend.isPending || detailTooLong || detailMissingForOther
            }
            onClick={() => {
              reportFriend.mutate(
                {
                  friendId,
                  body: {
                    reason: reason as
                      | 'HARASSMENT'
                      | 'INAPPROPRIATE_PROFILE'
                      | 'CHEATING_OR_FRAUD'
                      | 'SPAM'
                      | 'OTHER',
                    detail:
                      detail.trim().length > 0 ? detail.trim() : undefined,
                  },
                },
                { onSuccess: handleClose }
              );
            }}
          >
            {reportFriend.isPending ? '접수 중...' : '신고 접수하기'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

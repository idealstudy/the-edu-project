'use client';

import { useState } from 'react';

import { type ChallengeInvite } from '@/entities/social';
import { Button, Dialog, showBottomToast } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { Check, Copy, Swords } from 'lucide-react';

import { useCreateChallengeInviteMutation } from '../../hooks';

type ChallengeShareButtonProps = {
  challengeId: number;
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'large' | 'medium' | 'small' | 'xsmall';
  className?: string;
  label?: string;
};

/* ─────────────────────────────────────────────────────
 * "도전장 보내기" 버튼 + 공유 다이얼로그
 *  - 클릭 시 shareToken 발급(POST) → 공유 링크 표시 + 복사
 * ────────────────────────────────────────────────────*/
export const ChallengeShareButton = ({
  challengeId,
  variant = 'secondary',
  size = 'small',
  className,
  label = '도전장 보내기',
}: ChallengeShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [invite, setInvite] = useState<ChallengeInvite | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, isPending, isError, reset } =
    useCreateChallengeInviteMutation();

  const shareUrl =
    invite && typeof window !== 'undefined'
      ? `${window.location.origin}${PUBLIC.CORE.INVITE.CHALLENGE(invite.shareToken)}`
      : '';

  const handleOpen = () => {
    setIsOpen(true);
    setInvite(null);
    setCopied(false);
    reset();
    mutate(
      { challengeId },
      { onSuccess: (created) => setInvite(created) }
    );
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showBottomToast('도전장 링크를 복사했어요.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showBottomToast('복사에 실패했어요. 링크를 직접 선택해 주세요.');
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpen}
      >
        <Swords
          size={18}
          className="mr-1.5 shrink-0"
        />
        {label}
      </Button>

      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <Dialog.Content className="max-w-[440px] gap-5">
          <Dialog.Header>
            <Dialog.Title className="font-headline2-heading">
              도전장 보내기
            </Dialog.Title>
            <Dialog.Description className="font-body2-normal text-text-sub1">
              친구에게 같은 문제를 풀어보라고 링크를 보내요. 누가 더 잘 푸는지
              겨뤄봐요.
            </Dialog.Description>
          </Dialog.Header>

          <Dialog.Body className="gap-4">
            {isPending && (
              <div className="bg-gray-1 h-12 w-full animate-pulse rounded-[8px]" />
            )}

            {isError && (
              <p className="font-body2-normal text-system-warning">
                도전장 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
            )}

            {invite && (
              <div className="flex items-stretch gap-2">
                <div className="border-line-line2 bg-gray-1 flex min-w-0 flex-1 items-center rounded-[8px] border px-3">
                  <span className="font-caption-normal text-text-sub1 truncate">
                    {shareUrl}
                  </span>
                </div>
                <Button
                  size="small"
                  variant="primary"
                  className="shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check
                      size={18}
                      className="mr-1 shrink-0"
                    />
                  ) : (
                    <Copy
                      size={18}
                      className="mr-1 shrink-0"
                    />
                  )}
                  {copied ? '복사됨' : '복사'}
                </Button>
              </div>
            )}
          </Dialog.Body>

          <Dialog.Footer className="justify-end">
            <Dialog.Close asChild>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClose}
              >
                닫기
              </Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

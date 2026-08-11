'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { InviteExitModal } from '@/features/invite/components/invite-exit-modal';
import { InviteLetter } from '@/features/invite/components/invite-letter';
import { InviteLoginModal } from '@/features/invite/components/invite-login-modal';
import { useInvitation } from '@/features/invite/hooks';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import { isAxiosError } from 'axios';

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleReject = () => {
    if (member) {
      router.push(PRIVATE.DASHBOARD.INDEX);
    } else {
      router.push(PUBLIC.CORE.INDEX);
    }
  };

  const inviteToken = searchParams.get('token');
  const { data, isLoading, error } = useInvitation(inviteToken);

  /**
   * 선생님 마이페이지의 `코드 복사`(v22 3708)로 받은 코드를 학생이 직접 넣는 자리.
   * 링크 없이 코드만 받은 학생에게 들어올 경로가 없으면 그 복사 버튼이 죽은 버튼이 된다.
   */
  const [typedCode, setTypedCode] = useState('');

  useEffect(() => {
    if (!error) return;
    const code = isAxiosError(error) ? error.response?.data?.code : undefined;
    if (code === 'INVITATION_EXPIRED') {
      router.push(PUBLIC.CORE.INVITE.ERROR('EXPIRED_LINK'));
    } else {
      router.push(PUBLIC.CORE.INVITE.ERROR('INVALID_LINK'));
    }
  }, [error, router]);

  if (!inviteToken) {
    return (
      <main className="bg-gray-white mx-auto flex h-[calc(100vh-var(--spacing-header-height))] w-full items-center justify-center px-6">
        <form
          className="border-gray-3 w-full max-w-dialog rounded-xl border bg-white p-6"
          data-testid="invite-code-form"
          onSubmit={(event) => {
            event.preventDefault();
            const code = typedCode.trim();
            if (!code) return;
            router.push(`/invite?token=${encodeURIComponent(code)}`);
          }}
        >
          <h1 className="text-lg font-extrabold">초대 코드 넣기</h1>
          <p className="text-gray-9 mt-2 text-xs">
            선생님께 받은 초대 코드를 붙여넣으면 수업으로 들어갑니다.
          </p>
          <input
            value={typedCode}
            onChange={(event) => setTypedCode(event.target.value)}
            aria-label="초대 코드"
            placeholder="초대 코드"
            className="border-gray-3 mt-4 min-h-11 w-full rounded-lg border px-3 text-sm"
          />
          <button
            type="submit"
            disabled={typedCode.trim().length === 0}
            className="mt-3 min-h-11 w-full cursor-pointer rounded-lg bg-[#f26a2e] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            들어가기
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="bg-gray-white mx-auto flex h-[calc(100vh-var(--spacing-header-height))] w-full items-center justify-center">
      <InviteLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        inviteToken={inviteToken}
      />
      <InviteExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleReject}
      />
      <InviteLetter
        data={data}
        isLoading={isLoading}
        token={inviteToken}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenExitModal={() => setIsExitModalOpen(true)}
      />
    </main>
  );
}

import { useRouter } from 'next/navigation';

import { getCurrentMemberOptions, repository } from '@/entities/member';
import { LoginBody } from '@/features/auth/types';
import { useSession } from '@/providers/session/session-context';
import { api } from '@/shared/api';
import { trackAuthLoginSuccess } from '@/shared/lib/analytics';
import { useMemberStore } from '@/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * 오픈 리다이렉트 가드: 앱 내부 절대경로(`/...`)만 허용한다.
 * 프로토콜 상대경로(`//`)·외부 URL(`http(s):`)·백슬래시 트릭은 차단.
 */
const sanitizeRedirect = (raw?: string | null): string | null => {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  if (raw.includes('\\') || raw.startsWith('/\t')) return null;
  return raw;
};

// 로그인 — redirectTo 가 주어지면(예: 도전장 링크) 로그인 후 그 경로로 복귀한다.
export const useLogin = (redirectTo?: string | null) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const loginRequest = async (body: LoginBody) => {
    return await api.bff.client.post('/api/v1/auth/login', body, {
      withCredentials: true,
    });
  };

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async () => {
      const member = await queryClient.fetchQuery(
        getCurrentMemberOptions(true)
      );
      // 로그인 성공 이벤트
      trackAuthLoginSuccess(member?.role ?? null);
      // 역할별 랜딩 — 학생은 개인화 허브(/learning)로
      const roleDest =
        member?.role === 'ROLE_STUDENT' ? '/learning' : '/dashboard';
      const safeRedirect = sanitizeRedirect(redirectTo);
      // 프로필 미완성(ROLE_MEMBER)은 역할선택을 우선. 그 외에는 안전한 redirect 우선.
      const dest =
        member?.role === 'ROLE_MEMBER'
          ? '/select-role'
          : (safeRedirect ?? roleDest);
      router.replace(dest);
    },
  });
};

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearMember } = useMemberStore();
  const router = useRouter();

  return useMutation({
    mutationFn: repository.member.logout,
    // 요청 성공/실패와 무관하게 상태 정리
    onSuccess: async () => {
      clearMember();
      queryClient.clear();
      router.replace('/');
    },
  });
};

// 인증 상태, 액션을 제공하는 허브
export const useAuth = (redirectTo?: string | null) => {
  const { mutate: login, isPending: isLoggingIn } = useLogin(redirectTo);
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { member, refresh } = useSession();
  return { member, logout, isLoggingOut, login, isLoggingIn, refresh };
};

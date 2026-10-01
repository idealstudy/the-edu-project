'use client';

import { useSearchParams } from 'next/navigation';

import { resolveOAuthFrom } from '@/features/auth/lib/redirect';
import { env, serverEnv } from '@/shared/constants/api';
import { trackAuthKakaoLoginClick } from '@/shared/lib/analytics';

export default function SocialLoginButton() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const inviteToken = searchParams.get('token');
  // 도전장 등 이메일 로그인 경로가 쓰는 `redirect`도 함께 받아 `from`으로 승계한다
  // (redirect.ts#resolveOAuthFrom — 카카오 state에 redirect가 실리지 않아 유실되던
  // 버그의 수정. 백엔드는 이미 `from`을 select-role/홈 경로로 그대로 복원해준다).
  const from = resolveOAuthFrom({
    from: searchParams.get('from'),
    redirect: searchParams.get('redirect'),
  });

  // 주소를 렌더 시점에 바로 만든다. 예전에는 화면 스크립트가 켜진 뒤(useEffect)에야 채워져,
  // 스크립트가 못 켜진 화면에서 누르면 빈 주소라 같은 화면만 새로고침됐다(설치형 앱 2026-10-02).
  const stateParts: string[] = [];
  if (inviteToken) stateParts.push(`inviteToken:${inviteToken}`);
  if (from) stateParts.push(`from:${encodeURIComponent(from)}`);
  const state = stateParts.length
    ? `&state=${encodeURIComponent(stateParts.join('|'))}`
    : '';
  // 서버 렌더에서도 브라우저와 같은 공개 주소를 쓴다(서버 전용 내부 주소가 섞이면 안 된다).
  const kakaoRedirectBase = env.backendApiUrl ?? serverEnv.backendApiUrl;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${env.kakaoClientId}&redirect_uri=${kakaoRedirectBase}/auth/kakao/callback&response_type=code${state}`;

  return (
    <div className="my-4 block items-center">
      {error === 'kakao_failed' && (
        <div className="text-system-warning mb-4">
          카카오 로그인에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <a
        href={kakaoAuthUrl}
        onClick={trackAuthKakaoLoginClick}
        aria-label="카카오로 로그인"
        className="block h-14 rounded-xl bg-[#FEE500] bg-[url(/auth/kakao_login_large_narrow.png)] bg-contain bg-center bg-no-repeat"
      ></a>
    </div>
  );
}

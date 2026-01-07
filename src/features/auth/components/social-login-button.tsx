'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { env, serverEnv } from '@/shared/constants/api';

export default function SocialLoginButton() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${env.kakaoClientId}&redirect_uri=${serverEnv.backendApiUrl}/auth/kakao/callback&response_type=code`;

  return (
    <div className="mt-10 flex flex-col items-center">
      {error === 'kakao_failed' && (
        <div className="text-system-warning mb-4">
          카카오 로그인에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <a href={kakaoAuthUrl}>
        <Image
          src="/auth/kakao_login_large_wide.png"
          alt="카카오 소셜 로그인 버튼"
          width={400}
          height={224}
        />
      </a>
    </div>
  );
}

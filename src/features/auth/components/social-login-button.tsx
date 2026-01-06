'use client';

import Image from 'next/image';

import { serverEnv } from '@/shared/constants/api';

export default function SocialLoginButton() {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${serverEnv.kakaoClientId}&redirect_uri=${serverEnv.backendApiUrl}/auth/kakao/callback&response_type=code`;

  return (
    <div className="mt-10 flex justify-center">
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

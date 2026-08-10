'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const Preparing = () => {
  const router = useRouter();
  return (
    <div className="from-system-background to-orange-2 flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b px-6">
      <div className="max-w-dialog-sm relative w-full">
        <div className="absolute -top-5 -right-4 z-0 animate-bounce md:-right-10">
          <div className="bg-orange-7 rounded-card relative rotate-12 px-5 py-2 text-white">
            <span className="text-xl font-black tracking-widest uppercase md:text-base">
              Coming Soon
            </span>
            <div className="bg-orange-7 absolute -bottom-1 left-6 h-3 w-3 rotate-45"></div>
          </div>
        </div>

        <div className="max-w-dialog-sm relative aspect-square w-full">
          <Image
            src="/character/img_coming_soon01.png"
            alt="Preparing"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="mt-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          새로운 경험을 준비하고 있어요
        </h2>
        <p className="mt-3 text-base text-gray-500">
          조금만 기다려 주세요! <br className="md:hidden" /> 더 멋진 모습으로
          찾아뵙겠습니다.
        </p>
      </div>

      <button
        className="mt-12 cursor-pointer rounded-full bg-white px-10 py-3.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-md active:scale-95"
        onClick={() => {
          router.back();
        }}
      >
        이전 페이지로 돌아가기
      </button>
    </div>
  );
};

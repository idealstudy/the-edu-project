'use client';

import Link from 'next/link';

import { PUBLIC } from '@/shared/constants';

// Session8: CTA 섹션 (오렌지 배경)
export function Session8() {
  return (
    <section className="w-full bg-gradient-to-r from-[#ff4500] to-[#ff6b35] px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
          수업 관리, 이제 프로처럼
        </h2>
        <p className="mb-8 text-base text-white/90 md:text-lg lg:text-xl">
          학생 초대부터 수업노트, 과제, 질문 답변까지
          <br className="hidden md:block" />한 곳에서 체계적으로 관리하고 학부모
          신뢰를 얻으세요
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href={PUBLIC.CORE.SIGNUP}
            className="rounded-lg bg-white px-8 py-4 text-base font-bold text-[#ff4500] transition-colors hover:bg-gray-100 md:px-10 md:py-5 md:text-lg"
          >
            무료로 강사 등록하기
          </Link>
          <Link
            href={PUBLIC.CORE.INDEX}
            className="rounded-lg border-2 border-white bg-transparent px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/10 md:px-10 md:py-5 md:text-lg"
          >
            서비스 둘러보기
          </Link>
        </div>
      </div>
    </section>
  );
}

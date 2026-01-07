'use client';

import Image from 'next/image';
import Link from 'next/link';

import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib/utils';

// Session1: 히어로
export function Session1() {
  return (
    <section className="w-full bg-white px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* 히어로 타이틀 */}
        <div className="mb-8 text-center md:mb-12">
          <h1 className="text-3xl leading-tight font-bold tracking-[-0.05em] md:text-4xl lg:text-5xl xl:text-6xl">
            초1부터 고3까지, 목표 달성을 위한
            <br className="hidden md:block" />
            <span className="md:hidden"> </span>
            1:1 맞춤 수업 관리
          </h1>
          <p className="mt-4 text-base text-gray-600 md:mt-6 md:text-lg lg:text-xl">
            내신부터 수능, 특목고 입시까지 체계적인 학습 관리
          </p>
        </div>

        {/* 검색바 */}
        <div className="mb-6 flex justify-center md:mb-8">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Q 학년, 과목, 선생님 이름으로 검색해보세요"
              disabled
              className="w-full rounded-full border-2 border-gray-300 bg-gray-50 px-6 py-4 pl-12 text-base text-gray-500 focus:border-[#ff4500] focus:outline-none md:py-5 md:text-lg"
            />
            <Image
              src="/ic-search.svg"
              alt="검색"
              width={24}
              height={24}
              className="absolute top-1/2 left-4 -translate-y-1/2 opacity-50"
            />
            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
              <span className="text-xs text-gray-400 md:text-sm">준비 중</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#ff4500]"></div>
            </div>
          </div>
        </div>

        {/* 필터 버튼들 */}
        <div className="mb-8 flex flex-wrap justify-center gap-3 md:mb-12">
          {[
            '인기 준비',
            '수능 대비',
            '초등 내신',
            '고등 준비',
            '초등 영어',
          ].map((label) => (
            <button
              key={label}
              className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#ff4500] hover:text-[#ff4500] md:px-8 md:py-3 md:text-base"
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="flex justify-center gap-4">
          <Link
            href={PUBLIC.CORE.SIGNUP}
            className={cn(
              'rounded-lg bg-[#ff4500] px-8 py-4 text-base font-bold text-white transition-colors hover:bg-[#e64500] md:px-10 md:py-5 md:text-lg'
            )}
          >
            강사로 시작하기
          </Link>
          <Link
            href={PUBLIC.CORE.BIZ}
            className={cn(
              'rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 md:px-10 md:py-5 md:text-lg'
            )}
          >
            체험해보기
          </Link>
        </div>
      </div>
    </section>
  );
}

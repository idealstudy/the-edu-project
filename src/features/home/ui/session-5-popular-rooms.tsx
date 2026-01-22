'use client';

import Link from 'next/link';

import { PUBLIC } from '@/shared/constants';

// Session5: 인기 스터디룸 섹션
export function Session5() {
  const popularRooms = [
    {
      id: 1,
      title: '수능 국어 킬러 운항 정복',
      rating: 5.0,
      reviews: 342,
      price: 280000,
    },
    {
      id: 2,
      title: '중3 수학 내신 + 고입 대비',
      rating: 4.9,
      reviews: 126,
      price: 240000,
    },
    {
      id: 3,
      title: '초등 5-6학년 영어 문법',
      rating: 4.9,
      reviews: 126,
      price: 195000,
    },
    {
      id: 4,
      title: '고1-2 통합과학 내신대비',
      rating: 4.9,
      reviews: 113,
      price: 330000,
    },
  ];

  return (
    <section className="w-full bg-white px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* 섹션 헤더 */}
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
              인기 스터디룸
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              지금 가장 많은 학생들이 선택한 수업
            </p>
          </div>
          <Link
            href="/teachers?tab=studyRooms"
            className="hidden text-sm font-medium text-[#ff4500] hover:underline md:block md:text-base"
          >
            전체보기
          </Link>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularRooms.map((room) => (
            <div
              key={room.id}
              className="group relative rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-[#ff4500] hover:shadow-lg md:p-6"
            >
              {/* 곧 공개 배지 */}
              <div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ff6b35] px-3 py-1 text-xs font-semibold text-white shadow-md">
                곧 공개
              </div>
              <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                {/* 이미지 플레이스홀더 */}
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <span className="text-4xl">📚</span>
                </div>
              </div>
              <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 md:text-lg">
                {room.title}
              </h3>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="ml-1 text-sm font-semibold text-gray-900">
                    {room.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  ({room.reviews}개 후기)
                </span>
              </div>
              <p className="text-lg font-bold text-[#ff4500] md:text-xl">
                {room.price.toLocaleString()}원
              </p>
              <div className="mt-4">
                <Link
                  href={PUBLIC.CORE.LOGIN}
                  className="block w-full rounded-lg bg-[#ff4500] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e64500]"
                >
                  로그인 후 상세보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

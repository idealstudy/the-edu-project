'use client';

import Link from 'next/link';

import { PUBLIC } from '@/shared/constants';

// Session6: 추천 강사 프로필 섹션
export function Session6() {
  const instructors = [
    {
      id: 1,
      name: '이현우 선생님',
      rating: 5.0,
      reviews: 380,
      bio: '서울대학교 1학년',
    },
    {
      id: 2,
      name: '박수정 선생님',
      rating: 4.9,
      reviews: 425,
      bio: '수시 멘토링 전문',
    },
    {
      id: 3,
      name: '김민지 선생님',
      rating: 4.9,
      reviews: 350,
      bio: '영어 전문 강사',
    },
  ];

  return (
    <section className="w-full bg-gray-50 px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* 섹션 헤더 */}
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
              추천 강사 프로필
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              검증된 전문 강사들을 만나보세요
            </p>
          </div>
          <Link
            href={PUBLIC.CORE.INDEX}
            className="hidden text-sm font-medium text-[#ff4500] hover:underline md:block md:text-base"
          >
            전체 강사 보기
          </Link>
        </div>

        {/* 강사 카드 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-[#ff4500] hover:shadow-lg md:p-8"
            >
              {/* 곧 공개 배지 */}
              <div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ff6b35] px-3 py-1 text-xs font-semibold text-white shadow-md">
                곧 공개
              </div>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-orange-200 to-orange-300">
                  <div className="flex h-full items-center justify-center text-2xl">
                    👨‍🏫
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 md:text-xl">
                    {instructor.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {instructor.rating}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({instructor.reviews}개 후기)
                    </span>
                  </div>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-600 md:text-base">
                {instructor.bio}
              </p>
              <Link
                href={PUBLIC.CORE.LOGIN}
                className="block w-full rounded-lg border-2 border-[#ff4500] bg-white px-4 py-2 text-center text-sm font-semibold text-[#ff4500] transition-colors hover:bg-[#ff4500] hover:text-white"
              >
                프로필 보기
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

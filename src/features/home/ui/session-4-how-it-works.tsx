'use client';

import Link from 'next/link';

import { PRIVATE, PUBLIC } from '@/shared/constants';

// Session4: "이렇게 시작하세요" 섹션 - 강사 여정을 보여줌
export function Session4() {
  const steps = [
    {
      step: 1,
      title: '스터디룸 만들기',
      description:
        '과목별, 반별로 스터디룸을 만들어 학생들을 체계인 관리를 시작하세요.',
      action: '스터디룸 만들기',
      href: PRIVATE.ROOM.CREATE,
      features: ['과목 선택', '반 정보 입력', '수업 방식 설정'],
      studentValue: '내 학생들을 위한 온라인 스터디룸이 생성됩니다.',
    },
    {
      step: 2,
      title: '학생을 온라인 스터디룸에 초대하기',
      description: '초대 링크로 학생을 우리만의 온라인 스터디룸에 초대하세요.',
      action: '학생 초대하기',
      href: '#', // 로그인 후 사용 가능
      features: ['초대 링크 생성', '학생 관리', '권한 설정'],
      studentValue:
        '학생들은 초대받는 순간부터 체계적인 학습 관리의 혜택을 받게 됩니다.',
    },
    {
      step: 3,
      title: '수업노트 작성 및 학습 자료 관리',
      description: '수업 전 예습 복습 자료를 업로드하고 수업노트를 작성하세요.',
      action: '수업노트 작성하기',
      href: '#', // 로그인 후 사용 가능
      features: ['예습 자료 업로드', '수업노트 작성', '복습 자료 관리'],
      studentValue:
        '학생들은 수업전후 상시 스터디룸에 접속해 수업내용을 다시 볼 수 있습니다.',
    },
    {
      step: 4,
      title: '과제 부여 및 제출 자동 리마인더 알림',
      description:
        '학생들에게 자동으로 과제에 대한 리마인더를 보내고 제출 알림을 받아보세요.',
      action: '과제 관리하기',
      href: '#', // 로그인 후 사용 가능
      features: ['과제 부여', '자동 알림/리마인더', '제출 확인'],
      studentValue:
        '학생들은 자동으로 과제 알림을 받고, 제출 후 피드백을 바로 확인할 수 있습니다.',
    },
    {
      step: 5,
      title: '질문 답변 및 피드백',
      description:
        '학생의 질문에 실시간으로 답변하고, 과제에 상세한 피드백을 제공하세요',
      action: '질문 답변하기',
      href: '#', // 로그인 후 사용 가능
      features: ['질문 답변', '과제 피드백', '학습 진도 확인'],
      studentValue:
        '궁금한 점을 언제든지 물어보고, 선생님의 상세한 피드백으로 실력을 향상시킬 수 있습니다',
    },
  ];

  return (
    <section className="w-full bg-white px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* 섹션 헤더 */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
            이렇게 시작하세요
          </h2>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            5단계로 체계적인 수업 관리를 시작할 수 있습니다
          </p>
        </div>

        {/* 5단계 플로우 */}
        <div className="space-y-8 md:space-y-12">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="flex flex-col gap-6 rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-[#ff4500] hover:shadow-lg md:flex-row md:items-center md:gap-8 md:p-8"
            >
              {/* 왼쪽: 단계 번호 */}
              <div className="flex shrink-0 items-center justify-center md:w-32">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 md:h-24 md:w-24">
                    <span className="text-4xl font-bold text-[#ff4500] md:text-5xl">
                      {step.step}
                    </span>
                  </div>
                </div>
              </div>

              {/* 가운데: 설명 */}
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                  {step.title}
                </h3>
                <p className="mb-3 text-sm text-gray-600 md:text-base">
                  {step.description}
                </p>
                {/* 학생 가치 */}
                <div className="mb-3 rounded-lg bg-orange-50 p-3 md:p-4">
                  <p className="text-xs text-gray-700 md:text-sm">
                    {step.studentValue}
                  </p>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {step.features.map((feature, i) => (
                    <li
                      key={i}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 md:text-sm"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 오른쪽: 액션 버튼 */}
              <div className="flex shrink-0 md:w-40">
                {step.href === '#' ? (
                  <Link
                    href={PUBLIC.CORE.LOGIN}
                    className="w-full rounded-lg border-2 border-[#ff4500] bg-white px-6 py-3 text-center text-sm font-semibold text-[#ff4500] transition-colors hover:bg-[#ff4500] hover:text-white md:px-8 md:py-4 md:text-base"
                  >
                    로그인 후 시작
                  </Link>
                ) : (
                  <Link
                    href={step.href}
                    className="w-full rounded-lg bg-[#ff4500] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e64500] md:px-5 md:py-4 md:text-base"
                  >
                    {step.action}
                  </Link>
                )}
              </div>

              {/* 단계 사이 화살표 (모바일에서만) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center md:hidden">
                  <div className="text-2xl text-gray-300">↓</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 md:mt-16 md:p-8">
          <p className="text-center text-sm text-gray-600 md:text-base">
            <span className="font-semibold text-gray-900">곧 출시 예정:</span>{' '}
            스터디룸과 강사들이 플랫폼 전체에 노출되어 학생들이 수업을 찾을 수
            있는 마켓플레이스 기능이 추가됩니다
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center md:mt-12">
          <p className="mb-4 text-base text-gray-600 md:text-lg">
            지금 바로 시작해보세요
          </p>
          <Link
            href={PUBLIC.CORE.SIGNUP}
            className="inline-block rounded-lg bg-[#ff4500] px-8 py-4 text-base font-bold text-white transition-colors hover:bg-[#e64500] md:px-10 md:py-5 md:text-lg"
          >
            무료로 강사 등록하기
          </Link>
        </div>
      </div>
    </section>
  );
}

import { FC, SVGProps } from 'react';

import Link from 'next/link';

import { cn } from '@/shared/lib/utils';

interface OnboardingStepProps {
  step: number;
  IconComponent: FC<SVGProps<SVGElement>>;
  status: 'completed' | 'locked' | 'next';
  title: string;
  description: string;
  action: string;
  href: string;
  color: string;
}

export const OnboardingStep = ({
  step,
  IconComponent,
  status,
  title,
  description,
  action,
  href,
  color,
}: OnboardingStepProps) => {
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  const getStepNumberBgClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-orange-scale-orange-50';
      case 'locked':
        return 'bg-gray-400';
      default:
        return 'bg-[#ff4500]';
    }
  };

  const getTitleTextClass = () => {
    switch (status) {
      case 'completed':
        return 'text-orange-scale-orange-60';
      case 'locked':
        return 'text-gray-400';
      default:
        return 'text-gray-900';
    }
  };

  const getDescriptionTextClass = () => {
    switch (status) {
      case 'completed':
        return 'text-orange-scale-orange-50';
      case 'locked':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      {/* 왼쪽: 단계 번호 배지 (순서 강조) */}
      <div className="flex shrink-0 items-center gap-4 md:w-32">
        {isCompleted ? (
          <div className="from-orange-scale-orange-40 to-orange-scale-orange-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-md">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ) : (
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-md',
              color,
              isLocked && 'opacity-50'
            )}
          >
            <IconComponent
              aria-hidden
              className="text-orange-scale-orange-50 h-6 w-6"
            />
          </div>
        )}
        {/* 단계 번호 배지 - 순서 강조 */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-md',
            getStepNumberBgClass()
          )}
        >
          {step}
        </div>
      </div>

      {/* 가운데: 설명 */}
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          <h3
            className={cn(
              'text-xl font-bold whitespace-nowrap md:text-2xl',
              getTitleTextClass()
            )}
          >
            {title}
          </h3>
          {isCompleted && (
            <span className="bg-orange-scale-orange-1 text-orange-scale-orange-60 rounded-full px-2 py-1 text-xs font-semibold">
              완료
            </span>
          )}
          {isLocked && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
              잠김
            </span>
          )}
        </div>
        <p className={cn('text-sm md:text-base', getDescriptionTextClass())}>
          {description}
        </p>
      </div>

      {/* 오른쪽: 액션 버튼 */}
      <div className="flex shrink-0 md:w-40">
        {(() => {
          const stepStatus = isCompleted
            ? 'completed'
            : isLocked
              ? 'locked'
              : null;
          switch (stepStatus) {
            case 'completed':
              return (
                <div className="bg-orange-scale-orange-1 text-orange-scale-orange-60 flex w-full items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-semibold md:px-8 md:py-4 md:text-base">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  완료됨
                </div>
              );
            case 'locked':
              return (
                <button
                  disabled
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-gray-400 md:px-8 md:py-4 md:text-base"
                >
                  이전 단계 완료 필요
                </button>
              );
            default:
              return href === '#' ? (
                <button
                  disabled
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-gray-400 md:px-8 md:py-4 md:text-base"
                >
                  준비 중
                </button>
              ) : (
                <Link
                  href={href}
                  className="w-full rounded-lg bg-[#ff4500] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#e64500] md:px-6 md:py-4 md:text-base"
                >
                  {action}
                </Link>
              );
          }
        })()}
      </div>
    </div>
  );
};

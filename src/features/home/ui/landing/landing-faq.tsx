'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib';

const FAQ = [
  {
    q: '"제대로 풀었다"는 어떻게 판단하나요?',
    a: [
      '스스로 푼 자력 정답만 트리를 채웁니다.',
      '찍어서 맞히거나 해설을 먼저 본 문제는 정복도에 반영되지 않아요.',
    ],
  },
  {
    q: '막혔을 때 정답을 안 알려주면 어떻게 풀어요?',
    a: [
      'AI 코치가 정답 대신 다음 한 걸음을 같이 찾아줍니다.',
      '개념 다시 보기, 접근 방법 등 막힌 지점에 맞춰 힌트를 줘요.',
      '정답 해설은 따로 열 수 있지만, 그 문제는 트리에서 제외됩니다.',
    ],
  },
  {
    q: '약점 트리는 어떻게 채워지나요?',
    a: [
      '문제를 제대로 풀면 해당 단원 노드가 오렌지로 진해집니다.',
      '미진단(회색) → 약점(옅음) → 진행 → 정복(진함) 순으로 채워져요.',
      '반복해서 막힌 단원은 ⚠ 마커로 표시됩니다.',
    ],
  },
  {
    q: '무료로 사용할 수 있나요?',
    a: [
      '네, 오픈챌린지 문제 풀이와 약점 트리는 무료로 시작할 수 있습니다.',
      '가입 후 바로 오늘의 문제부터 풀어볼 수 있어요.',
    ],
  },
] as const;

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className={cn(
        'mx-auto flex w-full max-w-190 flex-col gap-6 px-6 py-14',
        'tablet:py-20'
      )}
    >
      <h2 className={cn('font-headline1-heading', 'tablet:font-title-heading')}>
        자주 묻는 질문
      </h2>
      <div className="flex flex-col gap-3">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="border-line-line1 overflow-hidden rounded-xl border bg-white"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  'font-body2-heading flex w-full items-center justify-between gap-3 px-5 py-4 text-start',
                  'tablet:px-6 tablet:py-5'
                )}
              >
                <span className="flex-1">{item.q}</span>
                <span
                  className={cn(
                    'text-orange-7 transition-transform',
                    isOpen && 'rotate-45'
                  )}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="border-line-line1 font-label-normal text-gray-9 tablet:font-body2-normal tablet:px-6 space-y-2 border-t px-5 py-4">
                  {item.a.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

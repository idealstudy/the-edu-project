import Image from 'next/image';

import { MathMarkdown } from '@/shared/components/markdown';
import { cn } from '@/shared/lib';
import { BarChart2, BookOpenCheck, Check, HelpCircle, X } from 'lucide-react';

import { SolutionPanel } from '../solve/solution-panel';

type ResultCrossCheckProps = {
  questionText: string;
  questionImageUrl: string | null;
  /** 내가 고른 답. sessionStorage 폴백 실패 시(게스트 등) null. */
  selectedAnswer: string | null;
  /** 정답. 방금 제출 직후에만 서버가 내려준다 — 새로고침 폴백에서는 null(해설 열람으로 확인). */
  correctAnswer: string | null;
  isCorrect: boolean | null;
  passRate: number | null;
  participantCount: number | null;
  /** 제출 직후 응답에 포함된 해설(무료 노출). */
  solutionText: string | null;
  /** 해설을 아직 모를 때(폴백), 포인트 차감 후 열람할 수 있는 완료 attempt id. */
  fallbackAttemptId: string | null;
  isLoggedIn: boolean;
};

/**
 * 결과 화면 크로스체크 레이아웃 — 좌: 문제+정오 비교 / 우: 해설.
 * 색상은 ResultStats 의 정답(system-success)/오답(system-warning) 토큰을 그대로 재사용한다.
 */
export const ResultCrossCheck = ({
  questionText,
  questionImageUrl,
  selectedAnswer,
  correctAnswer,
  isCorrect,
  passRate,
  participantCount,
  solutionText,
  fallbackAttemptId,
  isLoggedIn,
}: ResultCrossCheckProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 좌: 문제 + 내가 고른 답 vs 정답 */}
      <section
        className="border-line-line2 flex flex-col gap-4 rounded-[12px] border bg-white p-5"
        aria-label="문제와 내 답 비교"
      >
        <h2 className="font-body1-heading text-text-main">문제</h2>
        {questionImageUrl && (
          <div className="border-line-line2 bg-gray-1 overflow-hidden rounded-lg border">
            <Image
              src={questionImageUrl}
              alt={questionText}
              width={640}
              height={360}
              className="h-auto w-full object-contain"
            />
          </div>
        )}
        <p className="text-text-main text-sm leading-relaxed whitespace-pre-line">
          {questionText}
        </p>

        <div className="border-line-line2 grid grid-cols-2 gap-3 border-t pt-4">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-gray-8 text-xs">내가 고른 답</span>
            <span
              className={cn(
                'flex items-center gap-1 text-2xl font-bold',
                isCorrect === true && 'text-system-success',
                isCorrect === false && 'text-system-warning',
                isCorrect === null && 'text-text-main'
              )}
            >
              {isCorrect === true && (
                <Check
                  size={20}
                  color="var(--system-success)"
                />
              )}
              {isCorrect === false && (
                <X
                  size={20}
                  color="var(--system-warning)"
                />
              )}
              {selectedAnswer ?? '-'}
            </span>
          </div>
          <div className="border-line-line2 flex flex-col items-center gap-1.5 border-l text-center">
            <span className="text-gray-8 text-xs">정답</span>
            {correctAnswer ? (
              <span className="text-system-success text-2xl font-bold">
                {correctAnswer}
              </span>
            ) : (
              <span className="text-gray-7 flex items-center gap-1 text-sm">
                <HelpCircle
                  size={16}
                  aria-hidden
                />
                해설에서 확인
              </span>
            )}
          </div>
        </div>

        {(passRate !== null || participantCount !== null) && (
          <div className="text-gray-7 flex items-center gap-1.5 text-xs">
            <BarChart2
              size={14}
              aria-hidden
            />
            {passRate !== null ? `통과율 ${passRate}%` : '통과율 집계 중'}
            {participantCount !== null &&
              ` · 참여자 ${participantCount.toLocaleString()}명`}
          </div>
        )}
      </section>

      {/* 우: 해설 */}
      <section
        className="border-line-line2 flex flex-col gap-3 rounded-[12px] border bg-white p-5"
        aria-label="정답 해설"
      >
        <div className="flex items-center gap-2">
          <BookOpenCheck
            size={18}
            className="text-gray-7"
            aria-hidden
          />
          <h2 className="font-body1-heading text-text-main">정답 해설</h2>
        </div>
        {solutionText ? (
          <MathMarkdown
            content={solutionText}
            className="text-text-main text-sm leading-relaxed"
          />
        ) : fallbackAttemptId && isLoggedIn ? (
          <div className="flex flex-col gap-2">
            <p className="font-caption-normal text-text-sub2">
              새로고침으로 방금 푼 해설이 사라졌어요. 아래에서 다시 확인할 수
              있어요.
            </p>
            <SolutionPanel
              attemptId={fallbackAttemptId}
              isLoggedIn={isLoggedIn}
            />
          </div>
        ) : (
          <p className="font-caption-normal text-text-sub2">
            해설을 아직 볼 수 없어요.
          </p>
        )}
      </section>
    </div>
  );
};

'use client';

import type { QuestionBankItem, QuestionBankParams } from '@/entities/exam';
import { useQuestionBankQuery } from '@/features/exam/hooks/use-exam-query';
import { cn } from '@/shared/lib';

type QuestionBankPickerProps = {
  subject: NonNullable<QuestionBankParams['subject']>;
  treeNodeIds: number[];
  difficulty?: 'LOW' | 'MID' | 'HIGH';
  selected: QuestionBankItem[];
  onToggle: (question: QuestionBankItem) => void;
  onClearDifficulty: () => void;
};

export const QuestionBankPicker = ({
  subject,
  treeNodeIds,
  difficulty,
  selected,
  onToggle,
  onClearDifficulty,
}: QuestionBankPickerProps) => {
  const selectedIds = selected.map((item) => item.challengeId);
  const query = useQuestionBankQuery({
    subject,
    treeNodeIds,
    difficulty,
    excludeChallengeIds: [],
    page: 0,
    size: 20,
  });

  if (query.isError) {
    return (
      <div
        className="rounded-lg border border-[#efb5ae] bg-[#fff5f3] p-5"
        data-testid="question-bank-error"
      >
        <h4 className="text-sm font-extrabold text-[#9f2f26]">
          문항을 불러오지 못했어요
        </h4>
        <p className="mt-2 text-xs leading-6 text-[#755b58]">
          담은 문항은 그대로 남아 있습니다. 다시 불러오면 같은 조건에서
          이어집니다.
        </p>
        <button
          type="button"
          className="mt-3 cursor-pointer rounded-md border border-[#d88980] bg-white px-3 py-2 text-xs font-bold text-[#8c2f27]"
          onClick={() => void query.refetch()}
        >
          다시 불러오기
        </button>
      </div>
    );
  }

  if (!query.isPending && query.data?.content.length === 0) {
    return (
      <div
        className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-6 py-10 text-center"
        data-testid="question-bank-empty"
      >
        <h4 className="text-sm font-extrabold text-[#27272a]">
          이 조건에 맞는 문항이 아직 없어요
        </h4>
        <p className="mt-2 text-xs leading-6 text-[#71717a]">
          지금 선택한 과목과 조건에 맞는 문항이 없습니다.
          <br />
          난이도 조건을 풀어 다시 찾아보세요.
        </p>
        <button
          type="button"
          className="mt-4 cursor-pointer rounded-md bg-[#ef6c00] px-4 py-2 text-xs font-bold text-white"
          onClick={onClearDifficulty}
        >
          난이도 조건 빼고 다시 찾기
        </button>
      </div>
    );
  }

  return (
    <div data-testid="question-bank-list">
      {query.isPending ? (
        <p className="py-12 text-center text-xs text-[#71717a]">
          문항을 불러오는 중입니다
        </p>
      ) : (
        query.data?.content.map((question, index) => {
          const isSelected = selectedIds.includes(question.challengeId);
          return (
            <div
              key={question.challengeId}
              className={cn(
                'grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-[#ececef] py-3 last:border-b-0',
                isSelected && 'bg-[#fff8f1]'
              )}
              data-testid={`question-bank-item-${question.challengeId}`}
            >
              <span className="text-center text-xs font-extrabold text-[#52525b] tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 text-[13px] leading-5 font-semibold text-[#27272a]">
                {question.questionText ?? question.title}
                <small className="mt-1 block truncate text-[11px] font-normal text-[#71717a]">
                  {question.treeNodePath}
                  {question.wrongAnswerRate === null
                    ? ' · 오답률 자료 없음'
                    : ` · 오답률 ${question.wrongAnswerRate}%`}
                </small>
              </span>
              <button
                type="button"
                className={cn(
                  'cursor-pointer rounded-md border px-3 py-2 text-xs font-bold',
                  isSelected
                    ? 'border-[#ef6c00] bg-[#ef6c00] text-white'
                    : 'border-[#d4d4d8] bg-white text-[#3f3f46]'
                )}
                onClick={() => onToggle(question)}
              >
                {isSelected ? '담김' : '담기'}
              </button>
            </div>
          );
        })
      )}
      <p className="mt-3 text-[11px] leading-5 text-[#71717a]">
        단원은 <b>트리에서 골랐습니다.</b> 화면에 보이는 단원 이름이 그대로
        문항에 붙어 학생 숙련도로 자동으로 흘러갑니다.
      </p>
    </div>
  );
};

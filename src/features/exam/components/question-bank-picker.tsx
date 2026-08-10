'use client';

import type { QuestionBankItem, QuestionBankParams } from '@/entities/exam';
import { useQuestionBankQuery } from '@/features/exam/hooks/use-exam-query';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';

type QuestionBankPickerProps = {
  subject: NonNullable<QuestionBankParams['subject']>;
  treeNodeIds: number[];
  difficulty?: 'LOW' | 'MID' | 'HIGH';
  selected: QuestionBankItem[];
  onToggle: (question: QuestionBankItem) => void;
  onClearDifficulty: () => void;
  onChoosePdfPath: () => void;
};

export const QuestionBankPicker = ({
  subject,
  treeNodeIds,
  difficulty,
  selected,
  onToggle,
  onClearDifficulty,
  onChoosePdfPath,
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
        className="border-red-3 bg-red-1 rounded-lg border p-5"
        data-testid="question-bank-error"
      >
        <h4 className="text-red-10 text-sm font-extrabold">
          문항을 불러오지 못했어요
        </h4>
        <p className="text-gray-9 mt-2 text-xs leading-6">
          담은 문항은 그대로 남아 있습니다. 다시 불러오면 같은 조건에서
          이어집니다.
        </p>
        <UnstyledButton
          variant="unstyled"
          size="none"
          type="button"
          className="border-red-8 text-red-10 mt-3 cursor-pointer rounded-md border bg-white px-3 py-2 text-xs font-bold"
          onClick={() => void query.refetch()}
        >
          다시 불러오기
        </UnstyledButton>
      </div>
    );
  }

  if (!query.isPending && query.data?.content.length === 0) {
    return (
      <div
        className="border-gray-3 bg-gray-1 rounded-lg border px-6 py-10 text-center"
        data-testid="question-bank-empty"
      >
        <h4 className="text-gray-12 text-sm font-extrabold">
          이 조건에 맞는 문항이 아직 없어요
        </h4>
        <p className="text-gray-8 mt-2 text-xs leading-6">
          지금 선택한 과목과 조건에 맞는 문항이 없습니다.
          <br />
          난이도 조건을 풀어 다시 찾아보세요.
        </p>
        <UnstyledButton
          variant="unstyled"
          size="none"
          type="button"
          className="bg-orange-7 mt-4 cursor-pointer rounded-md px-4 py-2 text-xs font-bold text-white"
          onClick={onClearDifficulty}
        >
          난이도 조건 빼고 다시 찾기
        </UnstyledButton>
        <UnstyledButton
          variant="unstyled"
          size="none"
          type="button"
          className="text-gray-10 mt-3 block w-full cursor-pointer text-xs font-bold underline underline-offset-4"
          onClick={onChoosePdfPath}
        >
          PDF로 직접 올리기
        </UnstyledButton>
      </div>
    );
  }

  return (
    <div data-testid="question-bank-list">
      {query.isPending ? (
        <p className="text-gray-8 py-12 text-center text-xs">
          문항을 불러오는 중입니다
        </p>
      ) : (
        query.data?.content.map((question, index) => {
          const isSelected = selectedIds.includes(question.challengeId);
          return (
            <div
              key={question.challengeId}
              className={cn(
                'border-gray-2 grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0',
                isSelected && 'bg-orange-1'
              )}
              data-testid={`question-bank-item-${question.challengeId}`}
            >
              <span className="text-gray-10 text-center text-xs font-extrabold tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-gray-12 min-w-0 text-[13px] leading-5 font-semibold">
                {question.questionText ?? question.title}
                <small className="text-gray-8 mt-1 block truncate text-[11px] font-normal">
                  {question.treeNodePath}
                  {question.wrongAnswerRate === null
                    ? ' · 오답률 자료 없음'
                    : ` · 오답률 ${question.wrongAnswerRate}%`}
                </small>
              </span>
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                className={cn(
                  'cursor-pointer rounded-md border px-3 py-2 text-xs font-bold',
                  isSelected
                    ? 'border-orange-7 bg-orange-7 text-white'
                    : 'border-gray-4 text-gray-11 bg-white'
                )}
                onClick={() => onToggle(question)}
              >
                {isSelected ? '담김' : '담기'}
              </UnstyledButton>
            </div>
          );
        })
      )}
      <p className="text-gray-8 mt-3 text-[11px] leading-5">
        단원은 <b>트리에서 골랐습니다.</b> 화면에 보이는 단원 이름이 그대로
        문항에 붙어 학생 숙련도로 자동으로 흘러갑니다.
      </p>
    </div>
  );
};

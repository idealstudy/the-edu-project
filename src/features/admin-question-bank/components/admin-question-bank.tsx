'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { QuestionBankParams } from '@/entities/exam';
import { SUBJECT_TO_KOREAN } from '@/entities/study-room-preview';
import { useUpsertGradeCutoff } from '@/features/exam/hooks/use-exam-mutation';
import {
  useAdminExamsQuery,
  useAdminQuestionBankQuery,
} from '@/features/exam/hooks/use-exam-query';
import { Button, Input, Select } from '@/shared/components/ui';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyExamError } from '@/shared/lib/errors/errors';
import { zodResolver } from '@hookform/resolvers/zod';

import { type GradeCutoffForm, GradeCutoffFormSchema } from '../schema/schema';

type QuestionBankSubject = NonNullable<QuestionBankParams['subject']>;

const SUBJECT_OPTIONS = Object.entries(SUBJECT_TO_KOREAN) as Array<
  [QuestionBankSubject, string]
>;

export const AdminQuestionBank = () => {
  const [subject, setSubject] = useState<QuestionBankSubject>('MATH');
  const questionBank = useAdminQuestionBankQuery({
    subject,
    treeNodeIds: [],
    excludeChallengeIds: [],
    page: 0,
    size: 20,
  });
  const exams = useAdminExamsQuery();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GradeCutoffForm>({
    resolver: zodResolver(GradeCutoffFormSchema),
    defaultValues: {
      examId: 0,
      source: '',
      fullScore: 100,
      mean: '',
      stdDev: '',
      grade1: 92,
      grade2: 84,
      grade3: 76,
      grade4: 68,
      grade5: 60,
      grade6: 52,
      grade7: 44,
      grade8: 36,
    },
  });
  const examId = watch('examId');
  const cutoffMutation = useUpsertGradeCutoff(Number(examId));

  const onSubmit = (form: GradeCutoffForm) => {
    cutoffMutation.mutate(
      {
        source: form.source,
        fullScore: form.fullScore,
        mean: form.mean === '' ? undefined : form.mean,
        stdDev: form.stdDev === '' ? undefined : form.stdDev,
        cutoffs: [
          { grade: 1, minRawScore: form.grade1 },
          { grade: 2, minRawScore: form.grade2 },
          { grade: 3, minRawScore: form.grade3 },
          { grade: 4, minRawScore: form.grade4 },
          { grade: 5, minRawScore: form.grade5 },
          { grade: 6, minRawScore: form.grade6 },
          { grade: 7, minRawScore: form.grade7 },
          { grade: 8, minRawScore: form.grade8 },
        ],
      },
      {
        onError: (error) =>
          handleApiError(error, classifyExamError, {
            onField: (message) => setError('root', { message }),
            onContext: () =>
              setError('root', { message: '시험을 다시 선택해주세요.' }),
            onAuth: () =>
              setError('root', { message: '관리자 권한을 확인해주세요.' }),
          }),
      }
    );
  };

  const content = questionBank.data?.content ?? [];

  return (
    <div
      className="bg-[#f7f7f8] p-4 md:p-8"
      data-testid="admin-question-bank"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h1 className="text-[19px] font-extrabold text-[#27272a]">
            문제은행
          </h1>
          <span className="text-xs text-[#71717a]">
            선생님 시험 열기가 여기 데이터를 그대로 먹습니다.
          </span>
          <Button
            size="small"
            className="ml-auto"
          >
            일괄 올리기
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-xl border border-[#e4e4e7] bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-extrabold text-[#27272a]">문항</h2>
              <span className="text-xs text-[#71717a]">
                {questionBank.data?.totalElements ?? 0}개 · 검수 완료{' '}
                {questionBank.data?.totalElements ?? 0}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold text-[#52525b]">
              <Select
                value={subject}
                onValueChange={(value) =>
                  setSubject(value as QuestionBankSubject)
                }
              >
                <Select.Trigger
                  className="h-9 w-28 border-[#f0a36a] bg-[#fff7f0] text-xs"
                  data-testid="admin-question-bank-subject-filter"
                  aria-label="과목 필터"
                >
                  과목 {SUBJECT_TO_KOREAN[subject]}
                </Select.Trigger>
                <Select.Content>
                  {SUBJECT_OPTIONS.map(([value, label]) => (
                    <Select.Option
                      key={value}
                      value={value}
                    >
                      {label}
                    </Select.Option>
                  ))}
                </Select.Content>
              </Select>
              <span className="rounded-md border border-[#e4e4e7] px-3 py-2">
                검수 상태 전체
              </span>
            </div>

            {questionBank.isPending ? (
              <p className="py-12 text-center text-xs text-[#71717a]">
                문항을 불러오는 중입니다
              </p>
            ) : content.length === 0 ? (
              <div className="rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-6 py-12 text-center">
                <h3 className="text-sm font-extrabold text-[#27272a]">
                  이 단원에는 아직 문항이 없어요
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#71717a]">
                  선생님이 이 단원으로 시험을 열 수 없는 상태이니, 여기가 비면
                  그쪽도 막힙니다.
                </p>
                <Button
                  size="small"
                  className="mt-4"
                >
                  이 단원 문항 올리기
                </Button>
              </div>
            ) : (
              content.map((question) => (
                <div
                  key={question.challengeId}
                  className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-[#ececef] py-3 last:border-b-0"
                >
                  <span className="text-center text-xs font-extrabold text-[#52525b] tabular-nums">
                    {question.challengeId}
                  </span>
                  <span className="min-w-0 text-[13px] leading-5 font-semibold text-[#27272a]">
                    {question.questionText ?? question.title}
                    <small className="mt-1 block truncate text-[11px] font-normal text-[#71717a]">
                      {question.treeNodePath} · {question.sourceText}
                    </small>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-[#effaf1] px-2 py-1 text-[11px] font-bold text-[#237a3d]">
                      공개
                    </span>
                    <Button
                      size="xsmall"
                      variant="outlined"
                    >
                      보기
                    </Button>
                  </span>
                </div>
              ))
            )}
          </section>

          <aside>
            <section className="rounded-xl border border-[#e4e4e7] bg-white p-4">
              <h2 className="text-sm font-extrabold text-[#27272a]">
                일괄 올리기
              </h2>
              <p className="mt-3 text-xs leading-6 text-[#71717a]">
                단원은 <b>이름으로 맞춥니다.</b> 못 찾은 이름은 올리기 전에
                목록으로 보여주고 사람이 지정합니다. 이미 있는 문항은
                건너뜁니다.
              </p>
              <div className="mt-3 rounded-lg border border-[#e4e4e7] bg-[#fafafa] p-3 text-[11px] leading-5 text-[#52525b]">
                <b>마지막 올리기</b>
                <br />
                6월 학력평가 30문항 · 신규 30 · 건너뜀 0 · 단원 미매칭 0
              </div>
            </section>

            <form
              className="mt-4 rounded-xl border border-[#e4e4e7] bg-white p-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <h2 className="text-sm font-extrabold text-[#27272a]">
                등급 기준표 등록
              </h2>
              <p className="mt-1 text-[11px] leading-5 text-[#71717a]">
                기준표가 붙으면 학생에게 실측 등급과 표준점수가 표시됩니다.
              </p>
              <Select
                value={examId ? String(examId) : ''}
                onValueChange={(value) =>
                  setValue('examId', Number(value), { shouldValidate: true })
                }
              >
                <Select.Trigger
                  className="mt-3 w-full"
                  data-testid="grade-cutoff-exam"
                >
                  시험 선택
                </Select.Trigger>
                <Select.Content>
                  {(exams.data ?? []).map((exam) => (
                    <Select.Option
                      key={exam.examId}
                      value={String(exam.examId)}
                    >
                      {exam.title}
                    </Select.Option>
                  ))}
                </Select.Content>
              </Select>
              <Input
                className="mt-2"
                placeholder="출처: EBSi 2027 6월 모의평가"
                {...register('source')}
              />
              <p className="mt-3 text-[11px] leading-5 font-bold text-[#52525b]">
                1등급부터 8등급까지 원점수 하한
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((grade) => (
                  <Input
                    key={grade}
                    aria-label={`${grade}등급 원점수 하한`}
                    placeholder={`${grade}등급`}
                    {...register(`grade${grade}`)}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  placeholder="평균 선택"
                  {...register('mean')}
                />
                <Input
                  placeholder="표준편차 선택"
                  {...register('stdDev')}
                />
              </div>
              {(errors.root?.message ||
                errors.examId?.message ||
                errors.source?.message) && (
                <p
                  className="mt-2 text-xs font-bold text-[#a33a30]"
                  role="alert"
                >
                  {errors.root?.message ??
                    errors.examId?.message ??
                    errors.source?.message}
                </p>
              )}
              {cutoffMutation.isSuccess && (
                <p
                  className="mt-2 text-xs font-bold text-[#237a3d]"
                  role="status"
                >
                  등급 기준표를 등록했습니다.
                </p>
              )}
              <Button
                type="submit"
                className="mt-3 w-full"
                disabled={cutoffMutation.isPending}
              >
                기준표 저장
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
};

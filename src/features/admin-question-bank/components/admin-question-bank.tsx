'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';

import type { QuestionBankParams } from '@/entities/exam';
import { SUBJECT_TO_KOREAN } from '@/entities/study-room-preview';
import { useUpsertGradeCutoff } from '@/features/exam/hooks/use-exam-mutation';
import {
  useAdminExamsQuery,
  useAdminQuestionBankQuery,
} from '@/features/exam/hooks/use-exam-query';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { Button, Input, Select } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyExamError } from '@/shared/lib/errors/errors';
import { zodResolver } from '@hookform/resolvers/zod';

import { type GradeCutoffForm, GradeCutoffFormSchema } from '../schema/schema';
import {
  isQuestionBankSubjectAllowed,
  type QuestionBankGrade,
} from '@/features/exam/lib/question-bank-grade';

type QuestionBankSubject = NonNullable<QuestionBankParams['subject']>;

const SUBJECT_OPTIONS = Object.entries(SUBJECT_TO_KOREAN) as Array<
  [QuestionBankSubject, string]
>;

export const AdminQuestionBank = () => {
  const [subject, setSubject] = useState<QuestionBankSubject>('MATH');
  const [grade, setGrade] = useState<QuestionBankGrade>('HIGH_2');
  const [treeNodeId, setTreeNodeId] = useState<number | null>(null);
  const tree = useMyTreeQuery();
  const unitOptions = useMemo(
    () =>
      (tree.data?.groups ?? [])
        .filter((group) => isQuestionBankSubjectAllowed(grade, group.subject))
        .flatMap((group) => group.nodes)
        .filter((node) => node.depth > 0),
    [grade, tree.data]
  );
  const selectedUnit = unitOptions.find(
    (node) => Number(node.nodeId) === treeNodeId
  );
  /**
   * 승인 디자인 v22 `aBankOk` 4083 `검수 시작`.
   * v22 는 "공개하기 전에 정답과 단원을 사람이 확인합니다"라고 검수의 뜻을 적어 두었다.
   * 그래서 검수 대기 = 정답이 없거나 단원이 안 붙은 문항으로 본다.
   */
  const [reviewOnly, setReviewOnly] = useState(false);
  const [openedQuestionId, setOpenedQuestionId] = useState<number | null>(null);
  const questionBank = useAdminQuestionBankQuery({
    subject,
    grade,
    treeNodeIds: treeNodeId ? [treeNodeId] : [],
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

  const allContent = questionBank.data?.content ?? [];
  const needsReview = (question: (typeof allContent)[number]) =>
    !question.hasCorrectAnswer || question.treeNodeId === null;
  const pendingCount = allContent.filter(needsReview).length;
  const content = reviewOnly ? allContent.filter(needsReview) : allContent;
  const isBankEmpty = questionBank.data != null && allContent.length === 0;

  return (
    <div
      className="bg-gray-1 p-4 md:p-8"
      data-testid="admin-question-bank"
    >
      <div className="mx-auto max-w-295">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h1 className="text-gray-12 text-xl font-extrabold">문제은행</h1>
          {!isBankEmpty && (
            <span className="text-gray-9 text-xs">
              선생님 시험 열기가 여기 데이터를 그대로 먹습니다.
            </span>
          )}
          {!isBankEmpty && (
            <Button
              asChild
              size="small"
              className="ml-auto"
            >
              <Link href={PRIVATE.ADMIN.OPEN_CHALLENGE.NEW}>일괄 올리기</Link>
            </Button>
          )}
        </div>

        <div
          className={
            isBankEmpty
              ? 'grid gap-4'
              : 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'
          }
        >
          <section
            className={
              isBankEmpty ? '' : 'border-gray-3 rounded-xl border bg-white p-4'
            }
          >
            {!isBankEmpty && (
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-gray-12 text-sm font-extrabold">문항</h2>
                <span className="text-gray-9 text-xs">
                  {questionBank.data?.totalElements ?? 0}개 · 검수 완료{' '}
                  {allContent.length - pendingCount} · 검수 대기 {pendingCount}
                </span>
              </div>
            )}
            <div className="text-gray-10 mb-3 flex flex-wrap gap-2 text-xs font-bold">
              <>
                <Select
                  value={subject}
                  onValueChange={(value) => {
                    setSubject(value as QuestionBankSubject);
                    setTreeNodeId(null);
                  }}
                >
                  <Select.Trigger
                    className="border-orange-4 bg-orange-1 h-9 w-28 text-xs"
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
                <Select
                  value={treeNodeId ? String(treeNodeId) : 'ALL'}
                  onValueChange={(value) =>
                    setTreeNodeId(value === 'ALL' ? null : Number(value))
                  }
                >
                  <Select.Trigger
                    className="border-orange-4 bg-orange-1 h-9 min-w-36 text-xs"
                    data-testid="admin-question-bank-unit-filter"
                    aria-label="단원 필터"
                  >
                    단원 {selectedUnit?.displayName ?? '전체'}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Option value="ALL">전체 단원</Select.Option>
                    {unitOptions.map((node) => (
                      <Select.Option
                        key={node.nodeId}
                        value={String(node.nodeId)}
                      >
                        {node.displayName}
                      </Select.Option>
                    ))}
                  </Select.Content>
                </Select>
                <Select
                  value={grade}
                  onValueChange={(value) => {
                    setGrade(value as QuestionBankGrade);
                    setTreeNodeId(null);
                  }}
                >
                  <Select.Trigger
                    className="border-orange-4 bg-orange-1 h-9 w-24 text-xs"
                    data-testid="admin-question-bank-grade-filter"
                    aria-label="학년 필터"
                  >
                    학년 {grade === 'HIGH_1' ? '고1' : '고2'}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Option value="HIGH_1">고1</Select.Option>
                    <Select.Option value="HIGH_2">고2</Select.Option>
                  </Select.Content>
                </Select>
                {!isBankEmpty && (
                  <button
                    type="button"
                    aria-pressed={reviewOnly}
                    onClick={() => setReviewOnly((current) => !current)}
                    data-testid="admin-question-bank-review-filter"
                    className={`cursor-pointer rounded-md border px-3 py-2 ${
                      reviewOnly
                        ? 'border-orange-4 bg-orange-1 text-orange-11'
                        : 'border-gray-3'
                    }`}
                  >
                    검수 상태 {reviewOnly ? '검수 대기' : '전체'}
                  </button>
                )}
              </>
            </div>

            {questionBank.isPending ? (
              <p className="text-gray-9 py-12 text-center text-xs">
                문항을 불러오는 중입니다
              </p>
            ) : content.length === 0 ? (
              <div
                className="border-gray-3 rounded-row border border-dashed bg-white px-6 py-9.5 text-center"
                data-testid="admin-question-bank-empty"
              >
                <h3 className="text-gray-12 text-sm font-extrabold">
                  이 단원에는 아직 문항이 없어요
                </h3>
                <p className="text-gray-9 mt-2 text-xs leading-6">
                  선생님이 이 단원으로 시험을 열 수 없는 상태이니, 여기가 비면
                  그쪽도 막힙니다.
                </p>
                <Button
                  asChild
                  size="small"
                  className="mt-4"
                >
                  <Link
                    href={`${PRIVATE.ADMIN.OPEN_CHALLENGE.NEW}?grade=${grade}${
                      treeNodeId ? `&treeNodeId=${treeNodeId}` : ''
                    }`}
                  >
                    {SUBJECT_TO_KOREAN[subject]} 문항 올리기
                  </Link>
                </Button>
              </div>
            ) : (
              content.map((question) => (
                <div
                  key={question.challengeId}
                  className="border-gray-2 grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0"
                >
                  <span className="text-gray-10 text-center text-xs font-extrabold tabular-nums">
                    {question.challengeId}
                  </span>
                  <span className="text-coach text-gray-12 min-w-0 leading-5 font-semibold">
                    {question.questionText ?? question.title}
                    <small className="text-ui-choice text-gray-9 mt-1 block truncate font-normal">
                      {question.treeNodePath} · {question.sourceText}
                    </small>
                  </span>
                  <span className="flex items-center gap-2">
                    {needsReview(question) ? (
                      <span className="text-ui-choice bg-system-warning-alt text-system-warning-text rounded-full px-2 py-1 font-bold">
                        검수 대기
                      </span>
                    ) : (
                      <span className="text-ui-choice bg-system-success-alt text-system-success-text rounded-full px-2 py-1 font-bold">
                        공개
                      </span>
                    )}
                    <Button
                      size="xsmall"
                      variant="outlined"
                      onClick={() =>
                        setOpenedQuestionId((current) =>
                          current === question.challengeId
                            ? null
                            : question.challengeId
                        )
                      }
                    >
                      {openedQuestionId === question.challengeId
                        ? '닫기'
                        : '보기'}
                    </Button>
                  </span>
                  {openedQuestionId === question.challengeId && (
                    <div
                      className="border-gray-3 bg-gray-1 text-gray-11 col-span-3 rounded-lg border p-3 text-xs leading-6"
                      data-testid={`admin-question-bank-detail-${question.challengeId}`}
                    >
                      <p>
                        {question.questionText ?? '지문이 등록되지 않았습니다.'}
                      </p>
                      <p className="text-ui-choice text-gray-9 mt-2">
                        정답 {question.hasCorrectAnswer ? '등록됨' : '없음'} ·
                        단원 {question.treeNodePath || '미지정'} · 난이도{' '}
                        {question.difficulty}
                      </p>
                      {question.questionImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={question.questionImageUrl}
                          alt={`문항 ${question.challengeId} 이미지`}
                          className="mt-2 max-w-full rounded-md"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {!isBankEmpty && (
            <aside>
              {/* v22 `aBankOk` 4082 검수 대기 카드 + `검수 시작` */}
              <section className="border-gray-3 mb-4 rounded-xl border bg-white p-4">
                <h2 className="text-gray-12 text-sm font-extrabold">
                  검수 대기 {pendingCount}개
                </h2>
                <p className="text-gray-9 mt-3 text-xs leading-6">
                  공개하기 전에 정답과 단원을 사람이 확인합니다. 검수 안 된
                  문항은 선생님 시험 열기 목록에 뜨지 않습니다.
                </p>
                <Button
                  size="small"
                  className="mt-3 w-full"
                  disabled={pendingCount === 0}
                  data-testid="admin-question-bank-start-review"
                  onClick={() => {
                    setReviewOnly(true);
                    const first = allContent.find(needsReview);
                    setOpenedQuestionId(first ? first.challengeId : null);
                  }}
                >
                  검수 시작
                </Button>
                {pendingCount === 0 && (
                  <p className="text-ui-choice text-gray-9 mt-2">
                    이 과목에 검수 대기 문항이 없습니다.
                  </p>
                )}
              </section>

              <section className="border-gray-3 rounded-xl border bg-white p-4">
                <h2 className="text-gray-12 text-sm font-extrabold">
                  일괄 올리기
                </h2>
                <p className="text-gray-9 mt-3 text-xs leading-6">
                  단원은 <b>이름으로 맞춥니다.</b> 못 찾은 이름은 올리기 전에
                  목록으로 보여주고 사람이 지정합니다. 이미 있는 문항은
                  건너뜁니다.
                </p>
                <div className="text-ui-choice border-gray-3 bg-gray-1 text-gray-10 mt-3 rounded-lg border p-3 leading-5">
                  <b>마지막 올리기</b>
                  <br />
                  6월 학력평가 30문항 · 신규 30 · 건너뜀 0 · 단원 미매칭 0
                </div>
              </section>

              <form
                className="border-gray-3 mt-4 rounded-xl border bg-white p-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <h2 className="text-gray-12 text-sm font-extrabold">
                  등급 기준표 등록
                </h2>
                <p className="text-ui-choice text-gray-9 mt-1 leading-5">
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
                    aria-label="등급 기준표 시험 선택"
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
                <p className="text-ui-choice text-gray-10 mt-3 leading-5 font-bold">
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
                    className="text-system-warning-text mt-2 text-xs font-bold"
                    role="alert"
                  >
                    {errors.root?.message ??
                      errors.examId?.message ??
                      errors.source?.message}
                  </p>
                )}
                {cutoffMutation.isSuccess && (
                  <p
                    className="text-system-success-text mt-2 text-xs font-bold"
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
          )}
        </div>
      </div>
    </div>
  );
};

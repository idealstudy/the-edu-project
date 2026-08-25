'use client';

import { useEffect, useRef, useState } from 'react';

import type { QuestionBankItem, QuestionBankParams } from '@/entities/exam';
import { SUBJECT_TO_KOREAN } from '@/entities/study-room-preview';
import { useTeacherDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-teacher-dashboard-query';
import {
  useAssignExam,
  useCreateExam,
} from '@/features/exam/hooks/use-exam-mutation';
import { ExamWizardLayout } from '@/layout';
import { Select } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';

import { QuestionBankPicker } from './question-bank-picker';
import { TreeNodePicker } from './tree-node-picker';

type ExamCreateProps = {
  className?: string;
  initialStudyRoomId?: number;
};
type QuestionBankSubject = NonNullable<QuestionBankParams['subject']>;

const SUBJECT_OPTIONS = Object.entries(SUBJECT_TO_KOREAN) as Array<
  [QuestionBankSubject, string]
>;

export const ExamCreate = ({
  className,
  initialStudyRoomId,
}: ExamCreateProps) => {
  const roomsQuery = useTeacherDashboardStudyRoomListQuery();
  const createExam = useCreateExam();
  const assignExam = useAssignExam();
  const [studyRoomId, setStudyRoomId] = useState<number | null>(null);
  const [treeNodeIds, setTreeNodeIds] = useState<number[]>([]);
  const [subject, setSubject] = useState<QuestionBankSubject>('MATH');
  const [difficulty, setDifficulty] = useState<
    'LOW' | 'MID' | 'HIGH' | undefined
  >('MID');
  const [selected, setSelected] = useState<QuestionBankItem[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const pdfMethodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studyRoomId && roomsQuery.data?.[0]) {
      const requestedRoom = roomsQuery.data.find(
        (room) => room.id === initialStudyRoomId
      );
      setStudyRoomId(requestedRoom?.id ?? roomsQuery.data[0].id);
    }
  }, [initialStudyRoomId, roomsQuery.data, studyRoomId]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      );
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [startedAt]);

  const selectedRoom = roomsQuery.data?.find((room) => room.id === studyRoomId);
  const elapsed = `${Math.floor(elapsedSeconds / 60)}분 ${elapsedSeconds % 60}초`;
  const isPending = createExam.isPending || assignExam.isPending;
  const hasPublishError = message?.startsWith('시험이 저장되지') ?? false;

  const toggleQuestion = (question: QuestionBankItem) => {
    setMessage(null);
    setDraftMessage(null);
    setSelected((current) =>
      current.some((item) => item.challengeId === question.challengeId)
        ? current.filter((item) => item.challengeId !== question.challengeId)
        : [...current, question]
    );
  };

  const keepDraft = () => {
    setDraftMessage(
      `담은 문항 ${selected.length}개를 이 화면에 임시 보관했습니다.`
    );
  };

  const handlePublish = async () => {
    setMessage(null);
    if (!studyRoomId || selected.length === 0) {
      setMessage('문항을 1개 이상 담아야 낼 수 있어요');
      return;
    }
    try {
      const titleUnit =
        selected[0]?.treeNodePath.split(' > ').at(-1) ??
        SUBJECT_TO_KOREAN[subject];
      const created = await createExam.mutateAsync({
        title: `${titleUnit} 집중 시험`,
        subject,
        examType: 'NATIONAL',
        examTreeNodeIds: treeNodeIds,
        questions: selected.map((question, index) => ({
          questionNo: index + 1,
          challengeId: question.challengeId,
        })),
      });
      const assigned = await assignExam.mutateAsync({
        examId: created.examId,
        input: {
          studyRoomId,
          excludedStudentIds: [],
          studentIds: [],
          periodStart: new Date().toISOString(),
          periodEnd: null,
        },
      });
      setMessage(`${assigned.assignedStudentCount}명에게 시험을 배정했습니다.`);
      setSelected([]);
    } catch {
      setMessage(
        '시험이 저장되지 않았어요. 담은 문항은 그대로 있습니다. 다시 내기를 누르면 같은 문항 그대로 올라갑니다.'
      );
    }
  };

  return (
    <section
      className={cn('border-gray-3 rounded-xl border bg-white p-5', className)}
      data-testid="teacher-exam-card"
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <h2 className="text-gray-12 text-xl font-extrabold">시험 열기</h2>
        <span className="text-gray-8 text-xs">
          정답을 치지 않습니다. 단원 번호를 고르지 않습니다.
        </span>
      </div>

      <div className="border-gray-2 bg-gray-1 text-gray-8 mb-4 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold">
        <span className="text-orange-7">✓ 수업 고르기</span>
        <span>›</span>
        <span className="text-orange-7">✓ 문항 고르기</span>
        <span>›</span>
        <span className="bg-orange-7 rounded-full px-3 py-1 text-white">
          3 담은 문항 확인
        </span>
        <span className="ml-auto">여기까지 {elapsed} 걸렸습니다</span>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <div className="border-orange-7 bg-orange-1 rounded-lg border-2 p-3">
          <p className="text-orange-11 text-sm font-extrabold">
            문제은행에서 고르기
          </p>
          <p className="text-gray-8 mt-1 text-xs">
            정답과 단원이 따라옵니다 · 2~3분
          </p>
        </div>
        <div
          ref={pdfMethodRef}
          tabIndex={-1}
          data-testid="teacher-exam-pdf-method"
          className="border-gray-3 focus:border-orange-7 focus:ring-orange-3 rounded-lg border p-3 focus:ring-2 focus:outline-none"
        >
          <p className="text-gray-11 text-sm font-extrabold">
            게시된 시험 복제
          </p>
          <p className="text-gray-8 mt-1 text-xs">
            관리자가 올린 시험을 내 것으로 · 1분
          </p>
        </div>
        <div className="border-gray-3 rounded-lg border p-3">
          <p className="text-gray-11 text-sm font-extrabold">PDF 올리기</p>
          <p className="text-gray-8 mt-1 text-xs">
            정답을 직접 입력해야 합니다 · 10분 이상
          </p>
        </div>
      </div>

      {hasPublishError && (
        <div
          className="border-system-warning bg-system-warning-alt text-system-warning-text mb-4 rounded-lg border p-4 text-xs leading-6"
          role="alert"
          data-testid="exam-create-error"
        >
          <b className="block text-sm">시험이 저장되지 않았어요</b>
          {message?.replace('시험이 저장되지 않았어요. ', '')}
          <div className="mt-3 flex flex-wrap gap-2">
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-system-warning text-system-warning-text min-h-11 rounded-lg border bg-white px-3.5 text-xs font-extrabold"
              disabled={isPending}
              onClick={() => void handlePublish()}
            >
              다시 내기
            </UnstyledButton>
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-system-warning text-system-warning-text min-h-11 rounded-lg border bg-white px-3.5 text-xs font-extrabold"
              onClick={keepDraft}
            >
              임시 보관함에 넣어두기
            </UnstyledButton>
          </div>
          {draftMessage && (
            <p
              className="mt-2 font-bold"
              role="status"
            >
              {draftMessage}
            </p>
          )}
        </div>
      )}

      {hasPublishError ? (
        <ExamWizardLayout>
          <div className="border-gray-3 rounded-xl border p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-gray-12 text-sm font-extrabold">
                담은 문항 {selected.length}개
              </h3>
              <span className="text-gray-8 text-xs">그대로 남아 있습니다</span>
            </div>
            {selected.slice(0, 3).map((question, index) => (
              <div
                key={question.challengeId}
                className="border-gray-2 bg-orange-1 grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0"
              >
                <span className="text-gray-10 text-center text-xs font-extrabold tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-12 text-coach min-w-0 leading-5 font-semibold">
                  {question.questionText ?? question.title}
                  <small className="text-gray-8 text-ui-choice mt-1 block truncate font-normal">
                    {question.treeNodePath}
                  </small>
                </span>
                <span className="border-orange-7 bg-orange-7 rounded-md border px-3 py-2 text-xs font-bold text-white">
                  담김
                </span>
              </div>
            ))}
            <p className="text-gray-8 mt-3 text-xs">
              나머지 {Math.max(0, selected.length - 3)}문항도 유지됩니다.
              처음부터 다시 고르지 않아도 됩니다.
            </p>
          </div>
          <aside className="border-orange-4 bg-orange-1 h-fit rounded-xl border p-4">
            <p className="text-orange-11 text-xs font-extrabold">담은 문항</p>
            <p className="text-orange-7 mt-1 text-4xl font-black tabular-nums">
              {selected.length}
              <em className="ml-1 text-xs font-bold not-italic">문항</em>
            </p>
            <div className="border-orange-4 text-gray-10 mt-3 rounded-lg border bg-white p-3 text-xs leading-6">
              <b>자동으로 채워진 것</b>
              <br />
              정답{' '}
              <span className="text-system-success font-extrabold">
                {selected.length} / {selected.length}
              </span>{' '}
              · 단원{' '}
              <span className="text-system-success font-extrabold">
                {selected.filter((item) => item.treeNodeId).length} /{' '}
                {selected.length}
              </span>
            </div>
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-orange-10 bg-orange-7 mt-4 w-full rounded-lg border px-4 py-3 text-sm font-extrabold text-white"
              disabled={isPending}
              onClick={() => void handlePublish()}
            >
              다시 내기
            </UnstyledButton>
          </aside>
        </ExamWizardLayout>
      ) : (
        <ExamWizardLayout>
          <div className="border-gray-3 rounded-xl border p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-gray-12 text-sm font-extrabold">
                문항 고르기
              </h3>
              <span className="text-gray-8 text-xs">문제은행 276문항</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Select
                value={subject}
                onValueChange={(value) => {
                  setSubject(value as QuestionBankSubject);
                  setTreeNodeIds([]);
                  setSelected([]);
                }}
              >
                <Select.Trigger
                  className="h-9 w-28 text-xs"
                  data-testid="exam-subject-filter"
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
              <TreeNodePicker
                value={treeNodeIds}
                onChange={setTreeNodeIds}
              />
              <Select
                value={difficulty ?? 'ALL'}
                onValueChange={(value) =>
                  setDifficulty(
                    value === 'ALL'
                      ? undefined
                      : (value as 'LOW' | 'MID' | 'HIGH')
                  )
                }
              >
                <Select.Trigger
                  className="h-9 w-28 text-xs"
                  data-testid="exam-difficulty-filter"
                >
                  난이도{' '}
                  {difficulty === 'LOW'
                    ? '하'
                    : difficulty === 'HIGH'
                      ? '상'
                      : difficulty === 'MID'
                        ? '중'
                        : '전체'}
                </Select.Trigger>
                <Select.Content>
                  <Select.Option value="ALL">전체</Select.Option>
                  <Select.Option value="LOW">하</Select.Option>
                  <Select.Option value="MID">중</Select.Option>
                  <Select.Option value="HIGH">상</Select.Option>
                </Select.Content>
              </Select>
            </div>
            <QuestionBankPicker
              subject={subject}
              treeNodeIds={treeNodeIds}
              difficulty={difficulty}
              selected={selected}
              onToggle={toggleQuestion}
              onClearDifficulty={() => setDifficulty(undefined)}
              onChoosePdfPath={() => {
                pdfMethodRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
                pdfMethodRef.current?.focus();
              }}
            />
          </div>

          <aside className="border-orange-4 bg-orange-1 h-fit rounded-xl border p-4 lg:sticky lg:top-4">
            <p className="text-orange-11 text-xs font-extrabold">담은 문항</p>
            <p className="text-orange-7 mt-1 text-4xl font-black tabular-nums">
              {selected.length}
              <em className="ml-1 text-xs font-bold not-italic">문항</em>
            </p>
            <div className="border-orange-4 text-gray-10 mt-3 rounded-lg border bg-white p-3 text-xs leading-6">
              <b>자동으로 채워진 것</b>
              <br />
              정답{' '}
              <span className="text-system-success font-extrabold">
                {selected.length} / {selected.length}
              </span>{' '}
              · 단원{' '}
              <span className="text-system-success font-extrabold">
                {selected.filter((item) => item.treeNodeId).length} /{' '}
                {selected.length}
              </span>{' '}
              · 배점{' '}
              <span className="text-system-success font-extrabold">
                {selected.length} / {selected.length}
              </span>
            </div>
            <div className="border-system-success bg-system-success-alt text-system-success mt-2 rounded-lg border p-3 text-xs font-bold">
              이 화면에서 타이핑한 횟수 <b>0회</b>
            </div>
            <div className="mt-4">
              <p className="text-orange-11 mb-2 text-xs font-extrabold">
                어느 수업에 낼까요
              </p>
              <Select
                value={studyRoomId ? String(studyRoomId) : ''}
                onValueChange={(value) => setStudyRoomId(Number(value))}
              >
                <Select.Trigger
                  className="min-h-14 w-full bg-white text-left"
                  data-testid="teacher-exam-room"
                  aria-label="시험을 배정할 수업"
                >
                  {selectedRoom?.name ?? '수업 고르기'}
                </Select.Trigger>
                <Select.Content>
                  {(roomsQuery.data ?? []).map((room) => (
                    <Select.Option
                      key={room.id}
                      value={String(room.id)}
                    >
                      {room.name}
                    </Select.Option>
                  ))}
                </Select.Content>
              </Select>
              <p className="text-gray-8 text-ui-choice mt-2 leading-5">
                이 수업에서 열어 미리 골라졌습니다
              </p>
            </div>
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-orange-10 bg-orange-7 disabled:border-gray-3 disabled:bg-gray-3 disabled:text-gray-8 mt-4 w-full cursor-pointer rounded-lg border px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed"
              disabled={isPending || !studyRoomId || selected.length === 0}
              onClick={() => void handlePublish()}
              data-testid="teacher-exam-assign-button"
            >
              {isPending ? '시험을 내는 중입니다' : '시험 내기'}
            </UnstyledButton>
            <p className="text-gray-8 text-ui-choice mt-2 text-center">
              내면 그 학생 응시장에 <b>우리 수업</b> 배지로 바로 뜹니다
            </p>
            {message && !hasPublishError && (
              <p
                className="text-gray-10 mt-3 text-center text-xs font-bold"
                role="status"
              >
                {message}
              </p>
            )}
          </aside>
        </ExamWizardLayout>
      )}
    </section>
  );
};

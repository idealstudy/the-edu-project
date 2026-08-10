'use client';

import { useEffect, useRef, useState } from 'react';

import type { QuestionBankItem, QuestionBankParams } from '@/entities/exam';
import { SUBJECT_TO_KOREAN } from '@/entities/study-room-preview';
import { useTeacherDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-teacher-dashboard-query';
import {
  useAssignExam,
  useCreateExam,
} from '@/features/exam/hooks/use-exam-mutation';
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

  const toggleQuestion = (question: QuestionBankItem) => {
    setMessage(null);
    setSelected((current) =>
      current.some((item) => item.challengeId === question.challengeId)
        ? current.filter((item) => item.challengeId !== question.challengeId)
        : [...current, question]
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
      className={cn(
        'rounded-xl border border-[#e4e4e7] bg-white p-5',
        className
      )}
      data-testid="teacher-exam-card"
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <h2 className="text-[19px] font-extrabold text-[#27272a]">시험 열기</h2>
        <span className="text-xs text-[#71717a]">
          정답을 치지 않습니다. 단원 번호를 고르지 않습니다.
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#ececef] bg-[#fafafa] px-3 py-2 text-xs font-bold text-[#71717a]">
        <span className="text-[#ef6c00]">✓ 수업 고르기</span>
        <span>›</span>
        <span className="text-[#ef6c00]">✓ 문항 고르기</span>
        <span>›</span>
        <span className="rounded-full bg-[#ef6c00] px-3 py-1 text-white">
          3 담은 문항 확인
        </span>
        <span className="ml-auto">여기까지 {elapsed} 걸렸습니다</span>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <div className="rounded-lg border-2 border-[#ef6c00] bg-[#fff7f0] p-3">
          <p className="text-sm font-extrabold text-[#8f3f08]">
            문제은행에서 고르기
          </p>
          <p className="mt-1 text-xs text-[#71717a]">
            정답과 단원이 따라옵니다 · 2~3분
          </p>
        </div>
        <div
          ref={pdfMethodRef}
          tabIndex={-1}
          data-testid="teacher-exam-pdf-method"
          className="rounded-lg border border-[#e4e4e7] p-3 focus:border-[#ef6c00] focus:ring-2 focus:ring-[#f8c79e] focus:outline-none"
        >
          <p className="text-sm font-extrabold text-[#3f3f46]">
            게시된 시험 복제
          </p>
          <p className="mt-1 text-xs text-[#71717a]">
            관리자가 올린 시험을 내 것으로 · 1분
          </p>
        </div>
        <div className="rounded-lg border border-[#e4e4e7] p-3">
          <p className="text-sm font-extrabold text-[#3f3f46]">PDF 올리기</p>
          <p className="mt-1 text-xs text-[#71717a]">
            정답을 직접 입력해야 합니다 · 10분 이상
          </p>
        </div>
      </div>

      {message?.startsWith('시험이 저장되지') && (
        <div
          className="mb-4 rounded-lg border border-[#efb5ae] bg-[#fff5f3] p-4 text-xs leading-6 text-[#8c2f27]"
          role="alert"
          data-testid="exam-create-error"
        >
          <b className="block text-sm">시험이 저장되지 않았어요</b>
          {message.replace('시험이 저장되지 않았어요. ', '')}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-[#e4e4e7] p-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[#27272a]">
              문항 고르기
            </h3>
            <span className="text-xs text-[#71717a]">문제은행 276문항</span>
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

        <aside className="h-fit rounded-xl border border-[#f0a36a] bg-[#fff7f0] p-4 lg:sticky lg:top-4">
          <p className="text-xs font-extrabold text-[#8f3f08]">담은 문항</p>
          <p className="mt-1 text-4xl font-black text-[#ef6c00] tabular-nums">
            {selected.length}
            <em className="ml-1 text-xs font-bold not-italic">문항</em>
          </p>
          <div className="mt-3 rounded-lg border border-[#f0c08f] bg-white p-3 text-xs leading-6 text-[#62534a]">
            <b>자동으로 채워진 것</b>
            <br />
            정답{' '}
            <span className="font-extrabold text-[#237a3d]">
              {selected.length} / {selected.length}
            </span>{' '}
            · 단원{' '}
            <span className="font-extrabold text-[#237a3d]">
              {selected.filter((item) => item.treeNodeId).length} /{' '}
              {selected.length}
            </span>{' '}
            · 배점{' '}
            <span className="font-extrabold text-[#237a3d]">
              {selected.length} / {selected.length}
            </span>
          </div>
          <div className="mt-2 rounded-lg border border-[#9fd3ab] bg-[#effaf1] p-3 text-xs font-bold text-[#237a3d]">
            이 화면에서 타이핑한 횟수 <b>0회</b>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-extrabold text-[#8f3f08]">
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
            <p className="mt-2 text-[11px] leading-5 text-[#71717a]">
              이 수업에서 열어 미리 골라졌습니다
            </p>
          </div>
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            className="mt-4 w-full cursor-pointer rounded-lg border border-[#c95400] bg-[#ef6c00] px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:border-[#e4e4e7] disabled:bg-[#e4e4e7] disabled:text-[#71717a]"
            disabled={isPending || !studyRoomId || selected.length === 0}
            onClick={() => void handlePublish()}
            data-testid="teacher-exam-assign-button"
          >
            {isPending ? '시험을 내는 중입니다' : '시험 내기'}
          </UnstyledButton>
          <p className="mt-2 text-center text-[11px] text-[#71717a]">
            내면 그 학생 응시장에 <b>우리 수업</b> 배지로 바로 뜹니다
          </p>
          {message && !message.startsWith('시험이 저장되지') && (
            <p
              className="mt-3 text-center text-xs font-bold text-[#62534a]"
              role="status"
            >
              {message}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
};

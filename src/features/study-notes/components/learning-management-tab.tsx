'use client';

/**
 * 승인 디자인 v22 `srRoomManage`(prototypes/mvp-g-3역할-hub-opus.html 3554~3690).
 *
 * v22 는 네 행위 카드마다 <지금 손볼 것> 행을 깔고 행마다 처리 버튼을 붙였다.
 * 그 행이 구현에 통째로 빠져 있어서 손볼 것이 47건인 수업에서도 아무것도 뜨지 않았다(QA 8차 C조 #13).
 * 여기서 행을 되살리고 버튼마다 실제 호출을 붙였다. 시각만 만들고 핸들러를 안 붙이면 미구현이다(H4).
 */
import { useState } from 'react';

import Link from 'next/link';

import type { FeedbackRow, TodoRow } from '@/entities/learning-management';
import {
  useLearningManagementActions,
  useLearningManagementQuery,
} from '@/features/study-notes/hooks/use-learning-management';
import { Skeleton } from '@/shared/components/loading';
import { PRIVATE } from '@/shared/constants/route';

type Props = {
  studyRoomId: number;
};

const getActions = (studyRoomId: number) =>
  [
    {
      number: '1',
      title: '개념 노트 넣어주기',
      subtitle: '내가 정리한 개념을 학생 노트에 한 장으로 얹습니다',
      destination: '학생 › 단권화 노트 › 과목 › 단원',
      button: '새 노트 쓰기',
      href: PRIVATE.NOTE.CREATE(studyRoomId),
    },
    {
      number: '2',
      title: '할 일 넣어주기',
      subtitle: '오늘 뭘 할지 학생 목록에 직접 꽂습니다',
      destination: '학생 › 내 학습 › 오늘 할 일',
      button: '할 일 쓰기',
      href: PRIVATE.ROOM.MEMBERS(studyRoomId),
    },
    {
      number: '3',
      title: '문제 피드백 달기',
      subtitle: '틀린 문제 옆에 왜 틀렸는지 써 줍니다',
      destination: '학생 › 오답 회독',
      button: '코멘트 쓰기',
      href: PRIVATE.ROOM.MEMBERS(studyRoomId),
    },
    {
      number: '4',
      title: '시험 내주기',
      subtitle: '매일 하는 일이 아니라 네 번째로 뒀습니다',
      destination: '학생 › 응시장',
      button: '시험 열기',
      href: PRIVATE.DASHBOARD.TEACHER_EXAMS_FOR_ROOM(studyRoomId),
    },
  ] as const;

const rowClass =
  'border-gray-2 flex flex-wrap items-center gap-3 border-t py-3 first:border-t-0';
const tinyButton =
  'border-gray-3 text-gray-11 hover:border-gray-5 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
const tinyButtonPrimary =
  'border-orange-4 bg-orange-1 text-orange-11 hover:bg-orange-2 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const pill = (label: string, tone: 'done' | 'plain' | 'hidden') => (
  <span
    className={
      tone === 'done'
        ? 'text-ui-choice bg-system-success-alt text-system-success-text rounded-full px-2.5 py-1 font-bold'
        : tone === 'hidden'
          ? 'text-ui-choice bg-gray-2 text-gray-9 rounded-full px-2.5 py-1 font-bold'
          : 'text-ui-choice bg-gray-1 text-gray-10 rounded-full px-2.5 py-1 font-bold'
    }
  >
    {label}
  </span>
);

const emptyLine = (text: string) => (
  <p className="border-gray-2 text-gray-9 border-t pt-3 text-xs">{text}</p>
);

/** v22 §3 행: 코멘트 쓰기 / 코멘트 고치기 / 확인함 */
const FeedbackRowView = ({
  row,
  onSave,
  onAcknowledge,
  isBusy,
}: {
  row: FeedbackRow;
  onSave: (comment: string, done: () => void) => void;
  onAcknowledge: () => void;
  isBusy: boolean;
}) => {
  const [isWriting, setIsWriting] = useState(false);
  const [comment, setComment] = useState(row.teacherComment ?? '');

  return (
    <div
      className={rowClass}
      data-testid={`learning-management-feedback-row-${row.wrongAnswerId}`}
    >
      {row.studentQuestion
        ? pill('질문 옴', 'done')
        : pill(row.sourceLabel ?? '오답', 'plain')}
      <span className="min-w-0 flex-1">
        <b className="block truncate text-sm">
          {row.studentName ?? `학생 ${row.studentId}`} ·{' '}
          {row.title ?? `오답 ${row.wrongAnswerId}`}
        </b>
        <small className="text-gray-9 text-xs">
          {row.studentQuestion
            ? `학생이 되물었습니다 · ${row.studentQuestion}`
            : row.teacherComment
              ? `내 코멘트 · ${row.teacherComment}`
              : (row.reason ?? '회독이 멈춰 있습니다')}
        </small>
      </span>
      {isWriting ? (
        <form
          className="flex w-full gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = comment.trim();
            if (!trimmed) return;
            onSave(trimmed, () => setIsWriting(false));
          }}
        >
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={500}
            autoFocus
            aria-label="오답 코멘트"
            className="border-gray-3 min-w-0 flex-1 rounded-md border px-3 py-1.5 text-xs"
            placeholder="학생 오답 회독에 그대로 뜨는 문장입니다"
          />
          <button
            type="submit"
            className={tinyButtonPrimary}
            disabled={isBusy || comment.trim().length === 0}
          >
            저장
          </button>
          <button
            type="button"
            className={tinyButton}
            onClick={() => {
              setComment(row.teacherComment ?? '');
              setIsWriting(false);
            }}
          >
            취소
          </button>
        </form>
      ) : (
        <span className="flex shrink-0 gap-1.5">
          <button
            type="button"
            className={tinyButtonPrimary}
            onClick={() => setIsWriting(true)}
          >
            {row.teacherComment ? '코멘트 고치기' : '코멘트 쓰기'}
          </button>
          {!row.teacherComment && (
            <button
              type="button"
              className={tinyButton}
              disabled={isBusy}
              onClick={onAcknowledge}
            >
              확인함
            </button>
          )}
        </span>
      )}
    </div>
  );
};

/** v22 §2 행: 내일로 옮기기 / 확인함 / 승인 / 빼기 */
const TodoRowView = ({
  row,
  actions,
}: {
  row: TodoRow;
  actions: {
    defer: () => void;
    acknowledge: () => void;
    approve: () => void;
    reject: () => void;
    isBusy: boolean;
  };
}) => (
  <div
    className={rowClass}
    data-testid={`learning-management-todo-row-${row.todoId}`}
  >
    {row.kind === 'NOT_DONE'
      ? pill('못했어요', 'plain')
      : pill('승인 대기', 'plain')}
    <span className="min-w-0 flex-1">
      <b className="block truncate text-sm">
        {row.studentName ?? `학생 ${row.studentId}`} · {row.title}
      </b>
      <small className="text-gray-9 text-xs">
        {row.kind === 'NOT_DONE'
          ? (row.notDoneReason ?? '사유 없이 못했다고 남겼습니다')
          : `${row.source === 'EXAM_HALL' ? '응시장' : '오픈챌린지'} 제안 · 승인해야 학생에게 갑니다`}
      </small>
    </span>
    <span className="flex shrink-0 gap-1.5">
      {row.kind === 'NOT_DONE' ? (
        <>
          <button
            type="button"
            className={tinyButtonPrimary}
            disabled={actions.isBusy}
            onClick={actions.defer}
          >
            내일로 옮기기
          </button>
          <button
            type="button"
            className={tinyButton}
            disabled={actions.isBusy}
            onClick={actions.acknowledge}
          >
            확인함
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={tinyButtonPrimary}
            disabled={actions.isBusy}
            onClick={actions.approve}
          >
            승인
          </button>
          <button
            type="button"
            className={tinyButton}
            disabled={actions.isBusy}
            onClick={actions.reject}
          >
            빼기
          </button>
        </>
      )}
    </span>
  </div>
);

export const LearningManagementTab = ({ studyRoomId }: Props) => {
  const actions = getActions(studyRoomId);
  const query = useLearningManagementQuery(studyRoomId);
  const mutations = useLearningManagementActions(studyRoomId);

  const data = query.data;
  const noteRows = data?.noteRows ?? [];
  const todoRows = data?.todoRows ?? [];
  const feedbackRows = data?.feedbackRows ?? [];
  const isBusy =
    mutations.deferTodo.isPending ||
    mutations.acknowledgeTodo.isPending ||
    mutations.approveRecommendation.isPending ||
    mutations.rejectRecommendation.isPending ||
    mutations.acknowledgeWrongAnswer.isPending ||
    mutations.acknowledgeAllWrongAnswers.isPending ||
    mutations.saveComment.isPending;

  return (
    <div
      className="space-y-4"
      data-testid="learning-management-tab"
    >
      <section className="border-gray-3 rounded-xl border bg-white p-5">
        <h1 className="text-xl leading-7 font-extrabold">
          학생의 학습에
          <br />
          무엇을 넣어줄까요
        </h1>
        <p className="text-gray-9 mt-3 text-xs leading-5">
          이 탭은 학생을 지켜보는 곳이 아니라 <b>학생 화면에 넣어주는 곳</b>
          입니다. 각 행위가 도착하는 화면을 함께 표시합니다.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            href={actions[0].href}
            className="rounded-lg border p-3 text-left text-xs font-extrabold"
          >
            ＋ 개념 노트
            <small className="text-gray-9 mt-1 block font-normal">
              단권화에 넣기
            </small>
          </Link>
          <Link
            href={actions[1].href}
            className="rounded-lg border p-3 text-left text-xs font-extrabold"
          >
            ＋ 할 일
            <small className="text-gray-9 mt-1 block font-normal">
              오늘 할 일에 꽂기
            </small>
          </Link>
          <Link
            href={actions[2].href}
            className="rounded-lg border p-3 text-left text-xs font-extrabold"
          >
            ＋ 피드백
            <small className="text-gray-9 mt-1 block font-normal">
              오답에 코멘트
            </small>
          </Link>
        </div>
        <p
          className="text-orange-11 mt-3 text-xs font-bold"
          data-testid="learning-management-pending-count"
        >
          지금 손볼 것 {data?.pendingCount ?? 0}건
        </p>
      </section>

      {actions.map((action) => (
        <section
          key={action.number}
          className="border-gray-3 rounded-xl border bg-white p-5"
        >
          <div className="grid grid-cols-[36px_1fr_auto] gap-3">
            <span className="bg-orange-1 text-orange-11 flex size-9 items-center justify-center rounded-full text-sm font-extrabold">
              {action.number}
            </span>
            <div>
              <h2 className="text-sm font-extrabold">{action.title}</h2>
              <p className="text-gray-9 text-xs">{action.subtitle}</p>
              <p className="text-ui-choice bg-orange-1 mt-3 rounded-md px-3 py-2">
                <b className="text-orange-11 mr-2">학생 화면 도착지</b>
                {action.destination}
              </p>
            </div>
            <div className="flex h-fit shrink-0 gap-1.5">
              {action.number === '3' && feedbackRows.length > 0 && (
                <button
                  type="button"
                  className={tinyButton}
                  disabled={isBusy}
                  onClick={() => mutations.acknowledgeAllWrongAnswers.mutate()}
                  data-testid="learning-management-acknowledge-all"
                >
                  전부 확인함
                </button>
              )}
              <Link
                href={action.href}
                className="border-orange-4 text-orange-11 h-fit rounded-md border px-3 py-2 text-xs font-bold"
              >
                {action.button}
              </Link>
            </div>
          </div>

          <div className="mt-4">
            {query.isPending ? (
              <Skeleton.Block className="h-16 w-full" />
            ) : action.number === '1' ? (
              noteRows.length === 0 ? (
                emptyLine('아직 이 수업 학생 노트에 넣어준 장이 없습니다.')
              ) : (
                noteRows.map((row) => (
                  <div
                    key={row.pageId}
                    className={rowClass}
                    data-testid={`learning-management-note-row-${row.pageId}`}
                  >
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">
                        {row.studentName ?? `학생 ${row.studentId}`} ·{' '}
                        {row.title}
                      </b>
                      <small className="text-gray-9 text-xs">
                        {row.unitLabel ?? '단원 미지정'}
                        {row.state === 'HIDDEN'
                          ? ' · 학생이 숨김. 지워진 것은 아니고 학생 목록에서만 빠져 있습니다'
                          : ''}
                      </small>
                    </span>
                    {row.state === 'HIDDEN'
                      ? pill('학생이 숨김', 'hidden')
                      : pill('보냄', 'done')}
                  </div>
                ))
              )
            ) : action.number === '2' ? (
              todoRows.length === 0 ? (
                emptyLine('지금 손볼 할 일이 없습니다.')
              ) : (
                todoRows.map((row) => (
                  <TodoRowView
                    key={`${row.kind}-${row.todoId}`}
                    row={row}
                    actions={{
                      isBusy,
                      defer: () => mutations.deferTodo.mutate(row.todoId),
                      acknowledge: () =>
                        mutations.acknowledgeTodo.mutate(row.todoId),
                      approve: () =>
                        mutations.approveRecommendation.mutate(row.todoId),
                      reject: () =>
                        mutations.rejectRecommendation.mutate(row.todoId),
                    }}
                  />
                ))
              )
            ) : action.number === '3' ? (
              feedbackRows.length === 0 ? (
                emptyLine('코멘트를 기다리는 오답 신호가 없습니다.')
              ) : (
                feedbackRows.map((row) => (
                  <FeedbackRowView
                    key={row.wrongAnswerId}
                    row={row}
                    isBusy={isBusy}
                    onSave={(comment, done) =>
                      mutations.saveComment.mutate(
                        { wrongAnswerId: row.wrongAnswerId, comment },
                        { onSuccess: done }
                      )
                    }
                    onAcknowledge={() =>
                      mutations.acknowledgeWrongAnswer.mutate(row.wrongAnswerId)
                    }
                  />
                ))
              )
            ) : (
              emptyLine(
                '여기서 열면 배정 대상이 이 수업 학생으로 미리 골라져 있습니다.'
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

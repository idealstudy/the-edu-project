'use client';

import { useState } from 'react';

import { useAdminExamsQuery } from '@/features/exam/hooks/use-exam-query';
import { PageLayout } from '@/layout';
import { Button, Input } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';

import {
  useAdminPublicHall,
  usePostPublicExam,
  useUnpostPublicExam,
} from '../hooks/use-admin-operations';

const date = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(value)
  );

export const AdminPublicHall = () => {
  const hall = useAdminPublicHall();
  const exams = useAdminExamsQuery();
  const post = usePostPublicExam();
  const unpost = useUnpostPublicExam();
  const [showForm, setShowForm] = useState(false);
  const [examId, setExamId] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'NO_STUDY_ROOM'>(
    'NO_STUDY_ROOM'
  );
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const isHallEmpty = hall.data?.postings.length === 0;

  const publish = () => {
    if (!examId || !openAt) return;
    post.mutate(
      {
        examId: Number(examId),
        audience,
        openAt: new Date(openAt).toISOString(),
        closeAt: closeAt ? new Date(closeAt).toISOString() : null,
      },
      { onSuccess: () => setShowForm(false) }
    );
  };

  return (
    <PageLayout
      width="fluid"
      data-testid="admin-public-hall"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-extrabold">공개 응시장</h1>
        <span className="text-gray-8 text-xs">
          수업을 듣지 않는 학생에게 시험을 여는 자리입니다.
        </span>
        {!isHallEmpty && (
          <Button
            size="small"
            className="ml-auto"
            onClick={() => setShowForm((value) => !value)}
          >
            새로 게시
          </Button>
        )}
      </div>
      {showForm && (
        <section
          className="border-orange-3 bg-orange-1 mb-3 grid gap-2 rounded-xl border p-4 md:grid-cols-2"
          data-testid="public-exam-form"
        >
          <select
            className="border-gray-3 h-14 rounded border bg-white px-4 text-sm"
            value={examId}
            onChange={(event) => setExamId(event.target.value)}
            aria-label="게시할 시험"
          >
            <option value="">게시할 시험 선택</option>
            {exams.data?.map((exam) => (
              <option
                key={exam.examId}
                value={exam.examId}
              >
                {exam.title}
              </option>
            ))}
          </select>
          <select
            className="border-gray-3 h-14 rounded border bg-white px-4 text-sm"
            value={audience}
            onChange={(event) =>
              setAudience(event.target.value as typeof audience)
            }
            aria-label="응시 대상"
          >
            <option value="NO_STUDY_ROOM">스터디룸 없는 학생</option>
            <option value="ALL">전체</option>
          </select>
          <Input
            type="datetime-local"
            value={openAt}
            onChange={(event) => setOpenAt(event.target.value)}
            aria-label="게시 시작 시각"
          />
          <Input
            type="datetime-local"
            value={closeAt}
            onChange={(event) => setCloseAt(event.target.value)}
            aria-label="게시 종료 시각"
          />
          <Button
            className="md:col-span-2"
            disabled={!examId || !openAt || post.isPending}
            onClick={publish}
          >
            게시하기
          </Button>
        </section>
      )}
      {hall.isPending && (
        <section className="border-gray-3 text-gray-8 rounded-xl border bg-white p-10 text-center text-xs">
          공개 시험을 불러오는 중입니다.
        </section>
      )}
      {hall.isError && (
        <section className="border-red-3 bg-red-1 text-red-10 rounded-row border p-4 text-xs">
          공개 응시장을 불러오지 못했어요.
        </section>
      )}
      {hall.data && hall.data.postings.length === 0 && (
        <>
          <section
            className="border-gray-3 rounded-row border border-dashed bg-white px-6 py-9.5 text-center"
            data-testid="admin-public-hall-empty"
          >
            <h2 className="text-sm font-extrabold">
              지금 게시 중인 시험이 없어요
            </h2>
            <p className="text-gray-10 mt-2 text-xs leading-7">
              게시하지 않으면 반이 없는 학생은 응시할 시험이 하나도 없습니다. 그
              학생들의 대시보드 맨 위 <b>내 위치</b> 카드도 {`"없음"`} 상태로
              남습니다.
              <br />
              문제은행에 검수 완료 문항이 올라와 있습니다.
            </p>
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-orange-11 bg-orange-10 text-coach mt-4 min-h-11.5 rounded-lg border px-5 font-extrabold text-white"
              onClick={() => setShowForm(true)}
            >
              6월 학력평가로 게시하기
            </UnstyledButton>
          </section>
          <section className="border-gray-3 mt-3 rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-extrabold">영향을 받는 학생</h2>
            <p className="text-gray-8 text-xs">
              스터디룸이 없는 학생이 지금 응시장에서 빈 화면을 봅니다.
            </p>
          </section>
        </>
      )}
      {!!hall.data?.postings.length && (
        <>
          <section className="border-gray-3 mb-3 rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold">게시 중</h2>
              <span className="text-gray-8 text-xs">
                {hall.data.postings.length}건
              </span>
            </div>
            <div className="grid gap-2">
              {hall.data.postings.map((posting) => (
                <article
                  key={posting.postingId}
                  className="border-gray-3 flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1 text-xs font-bold">
                    {posting.title}
                    <small className="text-gray-8 text-ui-compact mt-0.5 block font-semibold">
                      {posting.questionCount}문항 · 대상:{' '}
                      {posting.audience === 'NO_STUDY_ROOM'
                        ? '스터디룸 없는 학생'
                        : '전체'}{' '}
                      · 게시 {date(posting.postedAt)} · 응시{' '}
                      {posting.attemptCount}명
                    </small>
                  </div>
                  <span className="bg-system-success-alt text-system-success text-ui-compact rounded-full px-2 py-1 font-extrabold">
                    게시 중
                  </span>
                  <UnstyledButton
                    variant="unstyled"
                    size="none"
                    type="button"
                    className="border-gray-3 min-h-11 rounded-lg border px-3 text-xs font-extrabold"
                    disabled={unpost.isPending}
                    onClick={() => unpost.mutate(posting.postingId)}
                  >
                    내리기
                  </UnstyledButton>
                </article>
              ))}
            </div>
          </section>
          <section className="border-gray-3 rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold">선생님이 복제해 간 것</h2>
              <span className="text-gray-8 text-xs">
                원본은 바뀌지 않습니다
              </span>
            </div>
            <div className="border-gray-3 text-gray-10 text-ui-choice rounded-lg border p-3 leading-7">
              {hall.data.clones.length
                ? hall.data.clones.map((clone) => (
                    <p key={clone.examId}>
                      <b className="text-gray-12">{clone.teacherName} 선생님</b>{' '}
                      · 원본 시험을 복제 → {`"${clone.title}"`} (
                      {clone.questionCount}문항)
                      <br />
                      원본 문항 수{' '}
                      <b className="text-gray-12 tabular-nums">
                        {clone.sourceQuestionCount}
                      </b>{' '}
                      · 변동 없음
                    </p>
                  ))
                : '아직 선생님이 복제해 간 시험이 없습니다.'}
            </div>
            <p className="text-gray-8 mt-2 text-xs">
              한 선생님의 수정이 다른 선생님과 공개 응시자에게 번지지 않게
              원본을 잠가둔 구조입니다.
            </p>
          </section>
        </>
      )}
    </PageLayout>
  );
};

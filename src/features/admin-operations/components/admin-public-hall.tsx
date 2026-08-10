'use client';

import { useState } from 'react';

import { useAdminExamsQuery } from '@/features/exam/hooks/use-exam-query';
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
    <main
      className="p-[14px] md:p-[22px]"
      data-testid="admin-public-hall"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[19px] font-extrabold">공개 응시장</h1>
        <span className="text-xs text-[#71717a]">
          수업을 듣지 않는 학생에게 시험을 여는 자리입니다.
        </span>
        <Button
          size="small"
          className="ml-auto"
          onClick={() => setShowForm((value) => !value)}
        >
          새로 게시
        </Button>
      </div>
      {showForm && (
        <section
          className="mb-3 grid gap-2 rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4 md:grid-cols-2"
          data-testid="public-exam-form"
        >
          <select
            className="h-14 rounded border border-[#e4e4e7] bg-white px-4 text-sm"
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
            className="h-14 rounded border border-[#e4e4e7] bg-white px-4 text-sm"
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
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-10 text-center text-xs text-[#71717a]">
          공개 시험을 불러오는 중입니다.
        </section>
      )}
      {hall.isError && (
        <section className="rounded-[10px] border border-[#f0c4c0] bg-[#fff4f2] p-4 text-xs text-[#a81b0e]">
          공개 응시장을 불러오지 못했어요.
        </section>
      )}
      {hall.data && hall.data.postings.length === 0 && (
        <>
          <section
            className="rounded-[10px] border border-dashed border-[#e4e4e7] bg-white px-6 py-[38px] text-center"
            data-testid="admin-public-hall-empty"
          >
            <h2 className="text-[15px] font-extrabold">
              지금 게시 중인 시험이 없어요
            </h2>
            <p className="mt-2 text-[12.5px] leading-7 text-[#52525b]">
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
              className="mt-4 min-h-[46px] rounded-lg border border-[#9a3412] bg-[#c2410c] px-5 text-[13px] font-extrabold text-white"
              onClick={() => setShowForm(true)}
            >
              6월 학력평가로 게시하기
            </UnstyledButton>
          </section>
          <section className="mt-3 rounded-xl border border-[#e4e4e7] bg-white p-4">
            <h2 className="mb-3 text-sm font-extrabold">영향을 받는 학생</h2>
            <p className="text-xs text-[#71717a]">
              스터디룸이 없는 학생이 지금 응시장에서 빈 화면을 봅니다.
            </p>
          </section>
        </>
      )}
      {!!hall.data?.postings.length && (
        <>
          <section className="mb-3 rounded-xl border border-[#e4e4e7] bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold">게시 중</h2>
              <span className="text-xs text-[#71717a]">
                {hall.data.postings.length}건
              </span>
            </div>
            <div className="grid gap-2">
              {hall.data.postings.map((posting) => (
                <article
                  key={posting.postingId}
                  className="flex min-h-12 items-center gap-2 rounded-lg border border-[#e4e4e7] px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1 text-[12.5px] font-bold">
                    {posting.title}
                    <small className="mt-0.5 block text-[10.5px] font-semibold text-[#71717a]">
                      {posting.questionCount}문항 · 대상:{' '}
                      {posting.audience === 'NO_STUDY_ROOM'
                        ? '스터디룸 없는 학생'
                        : '전체'}{' '}
                      · 게시 {date(posting.postedAt)} · 응시{' '}
                      {posting.attemptCount}명
                    </small>
                  </div>
                  <span className="rounded-full bg-[#f0fdf4] px-2 py-1 text-[10.5px] font-extrabold text-[#15803d]">
                    게시 중
                  </span>
                  <UnstyledButton
                    variant="unstyled"
                    size="none"
                    type="button"
                    className="min-h-11 rounded-lg border border-[#e4e4e7] px-3 text-xs font-extrabold"
                    disabled={unpost.isPending}
                    onClick={() => unpost.mutate(posting.postingId)}
                  >
                    내리기
                  </UnstyledButton>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-[#e4e4e7] bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold">선생님이 복제해 간 것</h2>
              <span className="text-xs text-[#71717a]">
                원본은 바뀌지 않습니다
              </span>
            </div>
            <div className="rounded-lg border border-[#e4e4e7] p-3 text-[11.5px] leading-7 text-[#52525b]">
              {hall.data.clones.length
                ? hall.data.clones.map((clone) => (
                    <p key={clone.examId}>
                      <b className="text-[#27272a]">
                        {clone.teacherName} 선생님
                      </b>{' '}
                      · 원본 시험을 복제 → {`"${clone.title}"`} (
                      {clone.questionCount}문항)
                      <br />
                      원본 문항 수{' '}
                      <b className="text-[#27272a] tabular-nums">
                        {clone.sourceQuestionCount}
                      </b>{' '}
                      · 변동 없음
                    </p>
                  ))
                : '아직 선생님이 복제해 간 시험이 없습니다.'}
            </div>
            <p className="mt-2 text-xs text-[#71717a]">
              한 선생님의 수정이 다른 선생님과 공개 응시자에게 번지지 않게
              원본을 잠가둔 구조입니다.
            </p>
          </section>
        </>
      )}
    </main>
  );
};

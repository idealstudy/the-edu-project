'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { type AdminConsultationCase } from '@/entities/admin-operations';
import { SearchInput, Textarea } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import { cn } from '@/shared/lib';

import {
  useAdminConsultations,
  useAdminSummary,
  useUpdateAdminConsultation,
} from '../hooks/use-admin-operations';

const states = [
  ['RECEIVED', '접수'],
  ['IN_PROGRESS', '처리 중'],
  ['ANSWERED', '답변 완료'],
] as const;
/**
 * 지연 = 받은 지 24시간이 지났는데 아직 접수 상태로 남은 문의.
 * 지연은 정렬 순위에서 뺐기 때문에(옛 지연 건이 앞을 점거해 신규 문의가 뒤로 밀리던 결함),
 * 몰아 보는 통로를 이 칩으로 둔다. 서버가 `delayedOnly` 로 DB 에서 걸러 준다.
 * 승인 디자인 v22 `aConsultOk` 4165~4168 에는 상태 칩 3개만 있어, 같은 형태로 하나 더 만들었다.
 */
const DELAYED = 'DELAYED';
type ConsultationFilter = (typeof states)[number][0] | typeof DELAYED;
const badge = {
  RECEIVED: 'bg-[#fff7ed] text-[#c2410c]',
  IN_PROGRESS: 'bg-[#eff6ff] text-[#1d4ed8]',
  ANSWERED: 'bg-[#f0fdf4] text-[#15803d]',
};
const roleLabel: Record<string, string> = {
  STUDENT: '학생',
  TEACHER: '선생님',
  PARENT: '보호자',
};

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '기록 없음';

export const AdminConsultations = () => {
  const [status, setStatus] = useState<ConsultationFilter | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<AdminConsultationCase | null>(null);
  const [answer, setAnswer] = useState('');
  const params = useMemo(
    () => ({
      // 지연 칩은 접수 상태 안에서 24시간을 넘긴 건만 본다. 걸러내기는 서버가 한다.
      status: status === DELAYED ? ('RECEIVED' as const) : status,
      delayedOnly: status === DELAYED || undefined,
      keyword: keyword || undefined,
      page: 0,
      size: 20,
    }),
    [keyword, status]
  );
  const query = useAdminConsultations(params);
  const summary = useAdminSummary();
  const update = useUpdateAdminConsultation();
  const selectedCase = selected ?? query.data?.content[0] ?? null;

  const updateCase = (nextStatus: 'IN_PROGRESS' | 'ANSWERED') => {
    if (!selectedCase || (nextStatus === 'ANSWERED' && !answer.trim())) return;
    update.mutate(
      {
        caseId: selectedCase.caseId,
        status: nextStatus,
        answer: answer.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelected(null);
          setAnswer('');
        },
      }
    );
  };

  return (
    <main
      className="p-[14px] md:p-[22px]"
      data-testid="admin-consultations"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[19px] font-extrabold">문의와 상담</h1>
        <span className="text-xs text-[#71717a]">
          들어온 문의를 받고 답하는 자리입니다. 학습 데이터는 여기서 열지
          않습니다.
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {states.map(([value, label]) => (
          <button
            key={value}
            type="button"
            data-testid={`admin-consultations-chip-${value}`}
            aria-pressed={
              (status === undefined && value === 'RECEIVED') || status === value
            }
            className={cn(
              // 좁은 폭에서 "답변 / 완료" 처럼 칩 안 문구가 쪼개지지 않게 한다.
              'flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-bold whitespace-nowrap',
              (status === undefined && value === 'RECEIVED') || status === value
                ? 'border-[#c2410c] bg-[#fff7ed] text-[#9a3412]'
                : 'border-[#e4e4e7] bg-white text-[#3f3f46]'
            )}
            onClick={() => {
              setStatus(value);
              setSelected(null);
            }}
          >
            {label}{' '}
            <b className="tabular-nums">
              {query.data?.statusCounts[value] ?? 0}
            </b>
          </button>
        ))}
        <button
          type="button"
          data-testid="admin-consultations-delayed-chip"
          aria-pressed={status === DELAYED}
          className={cn(
            // 배지 안에서 "지 / 연" 으로 쪼개지던 것을 막는다.
            'flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-bold whitespace-nowrap',
            status === DELAYED
              ? 'border-[#b91c1c] bg-[#fef2f2] text-[#991b1b]'
              : // 안 눌린 상태라도 지연이 남아 있으면 눈에 걸리게 둔다.
                // 다른 칩과 같은 회색이면 1200건이 쌓여도 그냥 지나친다.
                (query.data?.delayedCount ?? 0) > 0
                ? 'border-[#fca5a5] bg-white text-[#b91c1c]'
                : 'border-[#e4e4e7] bg-white text-[#3f3f46]'
          )}
          onClick={() => {
            setStatus(DELAYED);
            setSelected(null);
          }}
        >
          지연{' '}
          <b className="tabular-nums">{query.data?.delayedCount ?? 0}</b>
        </button>
        <SearchInput
          className="min-w-[180px] flex-1 bg-white"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(value) => setKeyword(value.trim())}
          placeholder="이름, 내용으로 검색"
        />
      </div>
      {query.isPending && (
        <section className="rounded-xl border border-[#e4e4e7] bg-white p-10 text-center text-xs text-[#71717a]">
          문의를 불러오는 중입니다.
        </section>
      )}
      {query.isError && (
        <section className="rounded-[10px] border border-[#f0c4c0] bg-[#fff4f2] p-4 text-xs text-[#a81b0e]">
          문의와 상담 목록을 불러오지 못했어요.
        </section>
      )}
      {query.data && query.data.content.length === 0 && status === DELAYED && (
        <section
          className="rounded-[10px] border border-dashed border-[#e4e4e7] bg-white px-6 py-[38px] text-center"
          data-testid="admin-consultations-delayed-empty"
        >
          <h2 className="text-[15px] font-extrabold">
            24시간을 넘긴 문의가 없어요
          </h2>
          <p className="mt-2 text-[12.5px] leading-7 text-[#52525b]">
            받은 문의에 모두 하루 안에 손을 댔습니다.
          </p>
          <button
            type="button"
            className="mt-4 min-h-[46px] rounded-lg border border-[#9a3412] bg-[#c2410c] px-5 text-[13px] font-extrabold text-white"
            onClick={() => {
              setStatus('RECEIVED');
              setSelected(null);
            }}
          >
            접수 {query.data.statusCounts.RECEIVED ?? 0}건 보기
          </button>
        </section>
      )}
      {query.data && query.data.content.length === 0 && status !== DELAYED && (
        <>
          <section
            className="rounded-[10px] border border-dashed border-[#e4e4e7] bg-white px-6 py-[38px] text-center"
            data-testid="admin-consultations-empty"
          >
            <h2 className="text-[15px] font-extrabold">받은 문의가 없어요</h2>
            <p className="mt-2 text-[12.5px] leading-7 text-[#52525b]">
              학생과 선생님이 앱 안에서 보낸 문의가 여기로 들어옵니다. 지난 30일
              동안 받은 문의는 <b>{summary.data?.consultationCount ?? 0}건</b>
              이고 모두 답변 완료입니다.
            </p>
            <button
              type="button"
              className="mt-4 min-h-[46px] rounded-lg border border-[#9a3412] bg-[#c2410c] px-5 text-[13px] font-extrabold text-white"
              onClick={() => setStatus('ANSWERED')}
            >
              답변 완료 {summary.data?.consultationCount ?? 0}건 보기
            </button>
          </section>
          <section className="mt-3 rounded-xl border border-[#e4e4e7] bg-white p-4">
            <h2 className="mb-3 text-sm font-extrabold">지난 30일</h2>
            <div className="flex justify-between border-b border-[#f4f4f5] py-2 text-xs">
              <span>받은 문의</span>
              <b className="tabular-nums">
                {summary.data?.consultationCount ?? 0}건
              </b>
            </div>
            <div className="flex justify-between border-b border-[#f4f4f5] py-2 text-xs">
              <span>평균 첫 응답</span>
              <b className="tabular-nums">
                {summary.data?.averageFirstResponseMinutes == null
                  ? '기록 없음'
                  : `${Math.floor(summary.data.averageFirstResponseMinutes / 60)}시간 ${summary.data.averageFirstResponseMinutes % 60}분`}
              </b>
            </div>
            <div className="flex justify-between py-2 text-xs">
              <span>가장 많았던 것</span>
              <b>
                {summary.data?.mostCommonConsultationCategory ?? '기록 없음'}
              </b>
            </div>
          </section>
        </>
      )}
      {!!query.data?.content.length && selectedCase && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,1fr)]">
          <div>
            <div className="overflow-x-auto rounded-xl border border-[#e4e4e7] bg-white px-2 py-1.5">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                <thead>
                  <tr className="text-[10.5px] text-[#71717a]">
                    {['상태', '문의', '보낸 사람', '받은 시각', '담당', ''].map(
                      (label, index) => (
                        <th
                          key={`${label}-${index}`}
                          className="border-b border-[#e4e4e7] px-2.5 py-2 font-extrabold"
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {query.data.content.map((item) => (
                    <tr
                      key={item.caseId}
                      className="hover:bg-[#fff7ed]"
                    >
                      <td className="border-b border-[#f4f4f5] px-2.5 py-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-1 text-[10.5px] font-extrabold whitespace-nowrap',
                            badge[item.status]
                          )}
                        >
                          {states.find(([value]) => value === item.status)?.[1]}
                        </span>
                        {/* 지연은 정렬이 아니라 이 표시와 지연 칩으로 드러낸다. */}
                        {item.delayed && (
                          <span
                            data-testid="admin-consultation-delayed-badge"
                            className="ml-1 inline-block rounded-full bg-[#fef2f2] px-2 py-1 text-[10.5px] font-extrabold whitespace-nowrap text-[#991b1b]"
                          >
                            지연
                          </span>
                        )}
                      </td>
                      <td className="border-b border-[#f4f4f5] px-2.5 py-3">
                        <b className="block">{item.title}</b>
                        <span className="mt-0.5 block max-w-[260px] truncate text-[11px] text-[#71717a]">
                          {item.message}
                        </span>
                      </td>
                      <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b]">
                        {item.senderName} (
                        {roleLabel[item.senderRole] ?? item.senderRole})
                      </td>
                      <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b] tabular-nums">
                        {date(item.receivedAt)}
                      </td>
                      <td className="border-b border-[#f4f4f5] px-2.5 py-3 text-[11px] text-[#52525b]">
                        {item.assigneeName ?? '아직 없음'}
                      </td>
                      <td className="border-b border-[#f4f4f5] px-2.5 py-3">
                        <button
                          type="button"
                          className={cn(
                            'min-h-11 rounded-lg border px-3 text-xs font-extrabold',
                            item.status === 'RECEIVED'
                              ? 'border-[#9a3412] bg-[#c2410c] text-white'
                              : 'border-[#e4e4e7]'
                          )}
                          onClick={() => {
                            setSelected(item);
                            setAnswer(item.answer ?? '');
                          }}
                        >
                          {item.status === 'RECEIVED' ? '답변 쓰기' : '열기'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/*
              문구 정본 = 구현. 승인 디자인 v22 4185 는 "목록 맨 위로 올라옵니다"라고 적었지만
              그 화면은 전체 5건 전제였다. 실제 1200여 건 환경에서 지연 우선 정렬은
              신규 문의를 마지막 페이지로 밀어냈다(fix-report-v8-2 A-2).
              지금 목록은 처리 상태 순이고 지연은 표시와 지연 칩으로 드러낸다.
            */}
            <p
              className="mt-3 text-xs text-[#71717a]"
              data-testid="admin-consultations-delay-note"
            >
              목록은 <b className="text-[#27272a]">접수 → 처리 중 → 답변 완료</b>{' '}
              순서로, 같은 상태 안에서는 최근에 받은 것부터 보여줍니다. 받은 지{' '}
              <b className="text-[#27272a]">24시간</b>이 지나도 접수 상태인
              문의는 <b className="text-[#27272a]">지연</b>으로 표시하고, 위
              지연 칩을 누르면 그것만 모아 볼 수 있습니다. 지금 지연은{' '}
              <b className="text-[#27272a] tabular-nums">
                {query.data.delayedCount}건
              </b>
              입니다.
            </p>
          </div>
          <div>
            <section className="mb-3 rounded-xl border border-[#e4e4e7] bg-white p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-extrabold">답변 쓰기</h2>
                <span className="text-xs text-[#71717a]">
                  {selectedCase.senderName} · {selectedCase.title}
                </span>
              </div>
              <div className="mb-3 rounded-lg border border-[#e4e4e7] p-3 text-[11.5px] leading-7 text-[#52525b]">
                <b className="text-[#27272a]">
                  {date(selectedCase.receivedAt)} · {selectedCase.senderName}
                </b>
                <br />
                {selectedCase.message}
              </div>
              <label
                htmlFor="consult-answer"
                className="text-[10.5px] font-extrabold text-[#71717a]"
              >
                답변
              </label>
              <Textarea
                id="consult-answer"
                className="mt-1 min-h-[120px] px-3 py-2 text-xs"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="보낸 사람에게 그대로 전달됩니다. 계정 조치가 필요하면 회원 상세에서 실행하고 여기에 결과만 적습니다."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 flex-1 rounded-lg border border-[#9a3412] bg-[#c2410c] px-3 text-xs font-extrabold text-white disabled:opacity-50"
                  disabled={!answer.trim() || update.isPending}
                  onClick={() => updateCase('ANSWERED')}
                >
                  답변 보내고 완료 처리
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-lg border border-[#e4e4e7] px-3 text-xs font-extrabold"
                  disabled={update.isPending}
                  onClick={() => updateCase('IN_PROGRESS')}
                >
                  처리 중으로 두기
                </button>
              </div>
              <p className="mt-2 text-xs text-[#71717a]">
                답변한 사람과 시각이 이력에 남습니다. 학생 학습 화면은 이
                자리에서 열 수 없습니다(학습 데이터 격리 §5.4).
              </p>
            </section>
            <section className="rounded-xl border border-[#e4e4e7] bg-white p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-extrabold">이 사람 계정</h2>
                <span className="text-xs text-[#71717a]">
                  문의 처리에 필요한 최소 정보만
                </span>
              </div>
              <div className="text-[11.5px] leading-7 text-[#52525b]">
                {selectedCase.senderName} ·{' '}
                {roleLabel[selectedCase.senderRole] ?? selectedCase.senderRole}
                <br />
                {selectedCase.senderContact ?? '연락처 미등록'}
              </div>
              {/*
                승인 디자인 v22 `aConsultOk` 4198: navigate /admin/members/{memberId}.
                접수 연락처로 회원을 찾은 경우에만 열 수 있다.
                못 찾으면 H3 대로 이유를 화면에 적는다(조건 없는 영구 비활성 금지).
              */}
              {selectedCase.senderMemberId ? (
                <Link
                  href={PRIVATE.ADMIN.MEMBERS.DETAIL(selectedCase.senderMemberId)}
                  className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border border-[#e4e4e7] text-xs font-extrabold"
                  data-testid="admin-consultation-open-member"
                >
                  회원 상세 열기
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="mt-3 min-h-11 w-full rounded-lg border border-[#e4e4e7] text-xs font-extrabold disabled:text-[#a1a1aa]"
                  >
                    회원 상세 열기
                  </button>
                  <p className="mt-2 text-[11.5px] text-[#71717a]">
                    접수 연락처로 회원 계정을 찾지 못했습니다. 비회원 문의이거나
                    가입 연락처가 다른 경우입니다.
                  </p>
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
};

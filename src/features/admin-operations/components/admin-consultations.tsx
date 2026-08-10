'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { type AdminConsultationCase } from '@/entities/admin-operations';
import { PageLayout } from '@/layout';
import { SearchInput, Textarea } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
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
  RECEIVED: 'bg-orange-1 text-orange-10',
  IN_PROGRESS: 'bg-orange-1 text-orange-11',
  ANSWERED: 'bg-system-success-alt text-system-success',
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

/**
 * 태블릿 1024(승인 디자인 v22 108~110 의 기본 프레임)에서 목록 칸은 500px 남짓이다.
 * 거기에 "8월 7일 오후 06:35" 를 그대로 넣으면 한 글자씩 세로로 쪼개져 읽을 수 없었다.
 * 좁은 폭에서는 날짜를 짧게 적고, 넓은 폭에서만 v22 가 그린 긴 표기를 쓴다.
 */
const shortDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
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
    <PageLayout
      width="fluid"
      data-testid="admin-consultations"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[19px] font-extrabold">문의와 상담</h1>
        <span className="text-gray-8 text-xs">
          들어온 문의를 받고 답하는 자리입니다. 학습 데이터는 여기서 열지
          않습니다.
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {states.map(([value, label]) => (
          <UnstyledButton
            variant="unstyled"
            size="none"
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
                ? 'bg-orange-1 text-orange-11 border-orange-10'
                : 'border-gray-3 text-gray-11 bg-white'
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
          </UnstyledButton>
        ))}
        <UnstyledButton
          variant="unstyled"
          size="none"
          type="button"
          data-testid="admin-consultations-delayed-chip"
          aria-pressed={status === DELAYED}
          className={cn(
            // 배지 안에서 "지 / 연" 으로 쪼개지던 것을 막는다.
            'flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-bold whitespace-nowrap',
            status === DELAYED
              ? 'border-red-10 bg-red-1 text-red-10'
              : // 안 눌린 상태라도 지연이 남아 있으면 눈에 걸리게 둔다.
                // 다른 칩과 같은 회색이면 1200건이 쌓여도 그냥 지나친다.
                (query.data?.delayedCount ?? 0) > 0
                ? 'border-red-4 text-red-10 bg-white'
                : 'border-gray-3 text-gray-11 bg-white'
          )}
          onClick={() => {
            setStatus(DELAYED);
            setSelected(null);
          }}
        >
          지연 <b className="tabular-nums">{query.data?.delayedCount ?? 0}</b>
        </UnstyledButton>
        <SearchInput
          className="min-w-[180px] flex-1 bg-white"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(value) => setKeyword(value.trim())}
          placeholder="이름, 내용으로 검색"
        />
      </div>
      {query.isPending && (
        <section className="border-gray-3 text-gray-8 rounded-xl border bg-white p-10 text-center text-xs">
          문의를 불러오는 중입니다.
        </section>
      )}
      {query.isError && (
        <section className="border-red-3 bg-red-1 text-red-10 rounded-[10px] border p-4 text-xs">
          문의와 상담 목록을 불러오지 못했어요.
        </section>
      )}
      {query.data && query.data.content.length === 0 && status === DELAYED && (
        <section
          className="border-gray-3 rounded-[10px] border border-dashed bg-white px-6 py-[38px] text-center"
          data-testid="admin-consultations-delayed-empty"
        >
          <h2 className="text-[15px] font-extrabold">
            24시간을 넘긴 문의가 없어요
          </h2>
          <p className="text-gray-10 mt-2 text-[12.5px] leading-7">
            받은 문의에 모두 하루 안에 손을 댔습니다.
          </p>
          <UnstyledButton
            variant="unstyled"
            size="none"
            type="button"
            className="border-orange-11 bg-orange-10 mt-4 min-h-[46px] rounded-lg border px-5 text-[13px] font-extrabold text-white"
            onClick={() => {
              setStatus('RECEIVED');
              setSelected(null);
            }}
          >
            접수 {query.data.statusCounts.RECEIVED ?? 0}건 보기
          </UnstyledButton>
        </section>
      )}
      {query.data && query.data.content.length === 0 && status !== DELAYED && (
        <>
          <section
            className="border-gray-3 rounded-[10px] border border-dashed bg-white px-6 py-[38px] text-center"
            data-testid="admin-consultations-empty"
          >
            <h2 className="text-[15px] font-extrabold">받은 문의가 없어요</h2>
            <p className="text-gray-10 mt-2 text-[12.5px] leading-7">
              학생과 선생님이 앱 안에서 보낸 문의가 여기로 들어옵니다. 지난 30일
              동안 받은 문의는 <b>{summary.data?.consultationCount ?? 0}건</b>
              이고 모두 답변 완료입니다.
            </p>
            <UnstyledButton
              variant="unstyled"
              size="none"
              type="button"
              className="border-orange-11 bg-orange-10 mt-4 min-h-[46px] rounded-lg border px-5 text-[13px] font-extrabold text-white"
              onClick={() => setStatus('ANSWERED')}
            >
              답변 완료 {summary.data?.consultationCount ?? 0}건 보기
            </UnstyledButton>
          </section>
          <section className="border-gray-3 mt-3 rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-extrabold">지난 30일</h2>
            <div className="border-gray-1 flex justify-between border-b py-2 text-xs">
              <span>받은 문의</span>
              <b className="tabular-nums">
                {summary.data?.consultationCount ?? 0}건
              </b>
            </div>
            <div className="border-gray-1 flex justify-between border-b py-2 text-xs">
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
        /*
          승인 디자인 v22 695~699 `.split` 그대로: 좌우 1.28 대 1, 모바일은 1단.
          `min-w-0` 은 v22 696 `.split>div{min-width:0}` 에 대응한다. 이게 없으면
          칸이 표의 최소폭(720px)만큼 벌어져 페이지 몸통이 통째로 좌우로 밀렸다
          (390px 실측 scrollWidth 752).
        */
        <div className="gap-block-gap lg:grid-split-v22 grid min-w-0 items-start">
          <div className="min-w-0">
            <div className="border-gray-3 overflow-x-auto rounded-xl border bg-white px-2 py-1.5">
              {/*
                v22 321~322 는 표 최소폭을 모바일(`.f.m`)에만 걸었다. 태블릿 1024 는
                v22 108~110 의 기본 프레임이라 표가 칸 안에 접혀 들어가야 하고,
                최소폭을 걸면 문의 제목이 오른쪽 답변 칸 뒤로 잘려 안 보였다.
              */}
              {/*
                좁은 폭에서는 칸 너비를 못 박는다(`table-fixed`). 자동 배분에 맡기면
                제목의 최대폭이 다른 칸을 밀어내 맨 오른쪽 "답변 쓰기" 버튼이
                카드 밖으로 잘려 누를 수 없었다. 넓은 폭(1280 이상)에서는
                v22 가 그린 자동 배분을 그대로 쓴다.
              */}
              <table className="w-full min-w-[560px] table-fixed border-collapse text-left text-xs lg:min-w-0 xl:table-auto">
                <thead>
                  {/*
                    v22 4171 은 여섯 칸(상태·문의·보낸 사람·받은 시각·담당·동작)을 그렸고
                    그 그림의 데이터는 다섯 줄에 제목도 짧았다. 실제 dev 데이터는 400건에
                    한 문장짜리 제목이라, 태블릿 목록 칸에 여섯 칸을 다 세우면 글자가
                    한 자씩 세로로 쪼개지고 맨 오른쪽 동작 버튼이 화면 밖으로 밀렸다.
                    그래서 넓은 화면(1280 이상)에서만 여섯 칸을 그대로 쓰고,
                    좁은 화면에서는 보낸 사람과 담당을 문의 칸 아래 줄로 접는다.
                    지우는 것이 아니라 자리를 옮기는 것이라 정보는 그대로 남는다.
                  */}
                  <tr className="text-gray-8 text-[10.5px]">
                    {(
                      [
                        ['상태', 'w-[104px] xl:w-auto'],
                        ['문의', ''],
                        ['보낸 사람', 'hidden xl:table-cell'],
                        ['받은 시각', 'w-[84px] xl:w-auto'],
                        ['담당', 'hidden xl:table-cell'],
                        ['', 'w-[96px] xl:w-auto'],
                      ] as const
                    ).map(([label, extra], index) => (
                      <th
                        key={`${label}-${index}`}
                        className={cn(
                          'border-gray-3 border-b px-2.5 py-2 font-extrabold',
                          extra
                        )}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {query.data.content.map((item) => (
                    <tr
                      key={item.caseId}
                      className="hover:bg-orange-1"
                    >
                      <td className="border-gray-1 border-b px-2.5 py-3 whitespace-normal xl:whitespace-nowrap">
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
                            className="bg-red-1 text-red-10 ml-1 inline-block rounded-full px-2 py-1 text-[10.5px] font-extrabold whitespace-nowrap"
                          >
                            지연
                          </span>
                        )}
                      </td>
                      <td className="border-gray-1 border-b px-2.5 py-3">
                        <b className="block">{item.title}</b>
                        <span className="text-gray-8 mt-0.5 block truncate text-[11px] xl:max-w-[260px]">
                          {item.message}
                        </span>
                        {/* 좁은 폭에서 접어 넣은 보낸 사람·담당. 넓은 폭에서는 제 칸으로 돌아간다. */}
                        <span className="text-gray-10 mt-1 block text-[11px] xl:hidden">
                          {item.senderName} (
                          {roleLabel[item.senderRole] ?? item.senderRole}) ·
                          담당 {item.assigneeName ?? '아직 없음'}
                        </span>
                      </td>
                      <td className="border-gray-1 text-gray-10 hidden border-b px-2.5 py-3 text-[11px] xl:table-cell">
                        {item.senderName} (
                        {roleLabel[item.senderRole] ?? item.senderRole})
                      </td>
                      <td className="border-gray-1 text-gray-10 border-b px-2.5 py-3 text-[11px] whitespace-nowrap tabular-nums">
                        <span className="xl:hidden">
                          {shortDate(item.receivedAt)}
                        </span>
                        <span className="hidden xl:inline">
                          {date(item.receivedAt)}
                        </span>
                      </td>
                      <td className="border-gray-1 text-gray-10 hidden border-b px-2.5 py-3 text-[11px] xl:table-cell">
                        {item.assigneeName ?? '아직 없음'}
                      </td>
                      <td className="border-gray-1 border-b px-2.5 py-3">
                        <UnstyledButton
                          variant="unstyled"
                          size="none"
                          type="button"
                          className={cn(
                            'min-h-11 rounded-lg border px-3 text-xs font-extrabold whitespace-nowrap',
                            item.status === 'RECEIVED'
                              ? 'border-orange-11 bg-orange-10 text-white'
                              : 'border-gray-3'
                          )}
                          onClick={() => {
                            setSelected(item);
                            setAnswer(item.answer ?? '');
                          }}
                        >
                          {item.status === 'RECEIVED' ? '답변 쓰기' : '열기'}
                        </UnstyledButton>
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
              className="text-gray-8 mt-3 text-xs"
              data-testid="admin-consultations-delay-note"
            >
              목록은 <b className="text-gray-12">접수 → 처리 중 → 답변 완료</b>{' '}
              순서로, 같은 상태 안에서는 최근에 받은 것부터 보여줍니다. 받은 지{' '}
              <b className="text-gray-12">24시간</b>이 지나도 접수 상태인 문의는{' '}
              <b className="text-gray-12">지연</b>으로 표시하고, 위 지연 칩을
              누르면 그것만 모아 볼 수 있습니다. 지금 지연은{' '}
              <b className="text-gray-12 tabular-nums">
                {query.data.delayedCount}건
              </b>
              입니다.
            </p>
          </div>
          <div className="min-w-0">
            <section className="border-gray-3 mb-3 rounded-xl border bg-white p-4">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="shrink-0 text-sm font-extrabold">답변 쓰기</h2>
                {/* 제목이 길면 이 줄이 칸을 밀어냈다. 넘치는 부분만 줄임표로 접는다. */}
                <span className="text-gray-8 min-w-0 truncate text-xs">
                  {selectedCase.senderName} · {selectedCase.title}
                </span>
              </div>
              <div className="border-gray-3 text-gray-10 mb-3 rounded-lg border p-3 text-[11.5px] leading-7">
                <b className="text-gray-12">
                  {date(selectedCase.receivedAt)} · {selectedCase.senderName}
                </b>
                <br />
                {selectedCase.message}
              </div>
              <label
                htmlFor="consult-answer"
                className="text-gray-8 text-[10.5px] font-extrabold"
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
                <UnstyledButton
                  variant="unstyled"
                  size="none"
                  type="button"
                  // "답변 보내고 완료 처 / 리" 로 쪼개지던 것을 막는다.
                  // 한 줄에 안 들어가면 두 번째 버튼이 아래 줄로 내려간다.
                  className="border-orange-11 bg-orange-10 min-h-11 flex-1 rounded-lg border px-3 text-xs font-extrabold whitespace-nowrap text-white disabled:opacity-50"
                  disabled={!answer.trim() || update.isPending}
                  onClick={() => updateCase('ANSWERED')}
                >
                  답변 보내고 완료 처리
                </UnstyledButton>
                <UnstyledButton
                  variant="unstyled"
                  size="none"
                  type="button"
                  className="border-gray-3 min-h-11 rounded-lg border px-3 text-xs font-extrabold whitespace-nowrap"
                  disabled={update.isPending}
                  onClick={() => updateCase('IN_PROGRESS')}
                >
                  처리 중으로 두기
                </UnstyledButton>
              </div>
              <p className="text-gray-8 mt-2 text-xs">
                답변한 사람과 시각이 이력에 남습니다. 학생 학습 화면은 이
                자리에서 열 수 없습니다(학습 데이터 격리 §5.4).
              </p>
            </section>
            <section className="border-gray-3 rounded-xl border bg-white p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-extrabold">이 사람 계정</h2>
                <span className="text-gray-8 text-xs">
                  문의 처리에 필요한 최소 정보만
                </span>
              </div>
              <div className="text-gray-10 text-[11.5px] leading-7">
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
                  href={PRIVATE.ADMIN.MEMBERS.DETAIL(
                    selectedCase.senderMemberId
                  )}
                  className="border-gray-3 mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border text-xs font-extrabold"
                  data-testid="admin-consultation-open-member"
                >
                  회원 상세 열기
                </Link>
              ) : (
                <>
                  <UnstyledButton
                    variant="unstyled"
                    size="none"
                    type="button"
                    disabled
                    className="border-gray-3 disabled:text-gray-7 mt-3 min-h-11 w-full rounded-lg border text-xs font-extrabold"
                  >
                    회원 상세 열기
                  </UnstyledButton>
                  <p className="text-gray-8 mt-2 text-[11.5px]">
                    접수 연락처로 회원 계정을 찾지 못했습니다. 비회원 문의이거나
                    가입 연락처가 다른 경우입니다.
                  </p>
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

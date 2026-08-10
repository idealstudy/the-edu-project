'use client';

import { useState } from 'react';

import { PageLayout } from '@/layout';
import { Button, Textarea } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';

import {
  useAdminMember,
  useRestoreAdminMember,
  useRevokeAdminMember,
} from '../hooks/use-admin-members';

const ROLE_LABEL = { STUDENT: '학생', TEACHER: '선생님', PARENT: '학부모' };
const SIGNUP_LABEL = {
  SELF: '직접 가입',
  TEACHER_INVITE: '학생 초대',
  OPEN_CHALLENGE: '오픈챌린지',
};

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '기록 없음';

export const AdminMemberDetail = ({ memberId }: { memberId: number }) => {
  const query = useAdminMember(memberId);
  const revoke = useRevokeAdminMember(memberId);
  const restore = useRestoreAdminMember(memberId);
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState(false);

  if (query.isPending) {
    return (
      <PageLayout
        width="fluid"
        className="text-gray-8 text-xs"
      >
        회원 정보를 불러오는 중입니다.
      </PageLayout>
    );
  }
  if (query.isError || !query.data) {
    return (
      <PageLayout width="fluid">
        <section className="border-red-3 bg-red-1 text-red-10 rounded-row border p-4 text-xs">
          회원 상세를 불러오지 못했어요.
        </section>
      </PageLayout>
    );
  }
  const member = query.data;
  const displayName = member.name || '이름 미등록';

  const executeRevoke = () => {
    revoke.mutate(
      { reason },
      {
        onSuccess: () => {
          setReason('');
          setShowReason(false);
        },
      }
    );
  };

  return (
    <PageLayout
      width="fluid"
      data-testid="admin-member-detail"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-gray-8 text-xs">회원 관리 ›</span>
        <h1 className="text-xl font-extrabold">{displayName}</h1>
        <span className="bg-orange-1 text-orange-11 text-ui-compact rounded-full px-2 py-1 font-extrabold">
          {ROLE_LABEL[member.role]}
        </span>
        <span
          className={cn(
            'text-ui-compact rounded-full px-2 py-1 font-extrabold',
            member.revoked
              ? 'bg-red-1 text-red-10'
              : 'bg-system-success-alt text-system-success'
          )}
        >
          {member.revoked ? '권한 회수' : '활성'}
        </span>
      </div>
      <div className="gap-block-gap lg:grid-split-legacy grid min-w-0 items-start">
        <div>
          <section className="border-gray-3 mb-3 rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-extrabold">계정</h2>
            <div className="text-gray-10 text-ui-choice leading-7">
              이메일 <b className="text-gray-12">{member.email}</b>
              <br />
              가입 경로{' '}
              <b className="text-gray-12">
                {member.signupPath
                  ? SIGNUP_LABEL[member.signupPath]
                  : '2026년 8월 이전 경로 미상'}
              </b>
              <br />
              가입 시각{' '}
              <b className="text-gray-12 tabular-nums">
                {date(member.signupAt)}
              </b>
              <br />
              마지막 접속{' '}
              <b className="text-gray-12 tabular-nums">
                {date(member.lastActiveAt)}
              </b>
              <br />
              스터디룸{' '}
              <b className="text-gray-12">
                {member.studyRooms.length
                  ? member.studyRooms.map((room) => room.name).join(', ')
                  : '없음'}
              </b>
            </div>
          </section>
          <section className="border-gray-3 rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold">조치 이력</h2>
              <span className="text-gray-8 text-xs">
                실행자와 시각이 남습니다
              </span>
            </div>
            <div className="border-gray-3 text-gray-10 text-ui-choice rounded-lg border p-3 leading-7">
              {member.actionHistory.length
                ? member.actionHistory.map((action) => (
                    <p key={action.actionId}>
                      <b className="text-gray-12 tabular-nums">
                        {date(action.actedAt)}
                      </b>{' '}
                      · {action.actorName}이{' '}
                      {action.action === 'REVOKED' ? '권한 회수' : '권한 복원'}{' '}
                      · {action.reason}
                    </p>
                  ))
                : '아직 관리자 조치 이력이 없습니다.'}
            </div>
          </section>
        </div>
        <div>
          <section className="border-gray-3 mb-3 rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-extrabold">지원</h2>
            <p className="text-gray-8 text-xs leading-7">
              문제를 재현해야 하면 선생님에게 화면 녹화를 요청합니다.{' '}
              <b className="text-gray-12">
                대리 로그인은 이번 판에서 뺐습니다.
              </b>{' '}
              지금은 대표 혼자 쓰는 단계라 남의 계정으로 들어가는 기능이 필요
              없고, 감사 로그를 읽는 화면까지 같이 유지하는 비용이 더 큽니다.
            </p>
            <a
              className="border-gray-3 mt-3 grid min-h-11 w-full place-items-center rounded-lg border text-xs font-extrabold"
              href={`mailto:${member.email}`}
            >
              이메일로 문의 보내기
            </a>
          </section>
          <section className="border-red-3 rounded-xl border bg-white p-4">
            <h2 className="text-red-10 mb-3 text-sm font-extrabold">
              권한 회수
            </h2>
            <p className="text-gray-8 text-xs leading-7">
              선생님 권한을 즉시 해제합니다. 이 선생님이 만든 스터디룸의 학생
              연결은 유지되지만 접근은 그 순간부터 막힙니다.
            </p>
            {member.revoked ? (
              <Button
                type="button"
                size="small"
                className="mt-3 w-full"
                disabled={restore.isPending}
                onClick={() => restore.mutate()}
              >
                권한 회수 되돌리기
              </Button>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  <UnstyledButton
                    variant="unstyled"
                    size="none"
                    type="button"
                    className="text-red-10 border-red-8 min-h-11 rounded-lg border px-3 text-xs font-extrabold"
                    onClick={() => {
                      setReason('일반 회원으로 강등: ');
                      setShowReason(true);
                    }}
                  >
                    일반 회원으로 강등
                  </UnstyledButton>
                  <UnstyledButton
                    variant="unstyled"
                    size="none"
                    type="button"
                    className="text-red-10 border-red-8 min-h-11 rounded-lg border px-3 text-xs font-extrabold"
                    onClick={() => {
                      setReason('로그인 즉시 정지: ');
                      setShowReason(true);
                    }}
                  >
                    로그인 즉시 정지
                  </UnstyledButton>
                </div>
                {showReason && (
                  <div className="mt-3">
                    <label
                      className="text-xs font-extrabold"
                      htmlFor="revoke-reason"
                    >
                      사유
                    </label>
                    <Textarea
                      id="revoke-reason"
                      className="mt-1 min-h-24 px-3 py-2 text-xs"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                    <Button
                      type="button"
                      size="small"
                      className="mt-2 w-full"
                      disabled={reason.trim().length < 5 || revoke.isPending}
                      onClick={executeRevoke}
                    >
                      사유를 남기고 실행
                    </Button>
                  </div>
                )}
              </>
            )}
            <p className="text-gray-8 mt-2 text-xs">
              실행하려면 사유를 적어야 합니다. 실행자, 시각, 사유가 이력에
              남습니다.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

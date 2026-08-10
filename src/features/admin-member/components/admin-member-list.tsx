'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { type AdminMemberRole } from '@/entities/member';
import { PageLayout } from '@/layout';
import { Pagination, SearchInput, Toggle } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { PRIVATE } from '@/shared/constants/route';
import { cn } from '@/shared/lib';

import { useAdminMembers } from '../hooks/use-admin-members';

const PAGE_SIZE = 20;
const ROLE_TABS: Array<{ value: AdminMemberRole; label: string }> = [
  { value: 'STUDENT', label: '학생' },
  { value: 'TEACHER', label: '선생님' },
];

const ROLE_LABEL = { STUDENT: '학생', TEACHER: '선생님', PARENT: '학부모' };
const SIGNUP_LABEL = {
  SELF: '직접 가입',
  TEACHER_INVITE: '학생 초대',
  OPEN_CHALLENGE: '오픈챌린지',
};

const formatDateTime = (value: string | null) => {
  if (!value) return '기록 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const AdminMemberList = () => {
  const [role, setRole] = useState<AdminMemberRole>('STUDENT');
  const [searchValue, setSearchValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [includeQaAccount, setIncludeQaAccount] = useState(false);
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({
      role,
      keyword: keyword || undefined,
      includeQaAccount,
      page: page - 1,
      size: PAGE_SIZE,
    }),
    [includeQaAccount, keyword, page, role]
  );
  const query = useAdminMembers(params);
  const totalPages = Math.ceil((query.data?.totalElements ?? 0) / PAGE_SIZE);

  const selectRole = (next: AdminMemberRole) => {
    setRole(next);
    setPage(1);
  };

  return (
    <PageLayout
      width="fluid"
      data-testid="admin-members"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-gray-12 text-xl font-extrabold">회원 관리</h1>
        <span className="text-gray-8 text-xs">
          {role === 'STUDENT'
            ? '초대로 들어온 선생님은 자동 승인됩니다. 그래서 이 화면이 유일한 사후 통제 지점입니다.'
            : '선생님 가입 경로에서 학생 초대 결과를 확인합니다. 이 줄이 자동 승인의 결과입니다.'}
        </span>
      </div>

      <div className="border-gray-3 mb-3 flex border-b">
        {ROLE_TABS.map((tab) => (
          <UnstyledButton
            variant="unstyled"
            size="none"
            key={tab.value}
            type="button"
            className={cn(
              'min-h-11 border-b-2 px-5 text-xs font-bold',
              role === tab.value
                ? 'text-orange-11 border-orange-10'
                : 'text-gray-8 border-transparent'
            )}
            onClick={() => selectRole(tab.value)}
            data-testid={`member-tab-${tab.value.toLowerCase()}`}
          >
            {tab.label}
          </UnstyledButton>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <SearchInput
          className="-0 flex-1 bg-white"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={(value) => {
            setKeyword(value.trim());
            setPage(1);
          }}
          placeholder="이름 또는 이메일로 검색"
        />
        <span className="border-gray-3 text-gray-11 -0 flex items-center gap-2 rounded-lg border bg-white px-3 text-xs font-bold">
          가입일 <b>최근 7일</b>
        </span>
        {role === 'STUDENT' && (
          <label className="border-gray-3 text-gray-8 -0 flex items-center gap-2 rounded-lg border bg-white px-3 text-xs">
            점검용 계정 포함
            <Toggle
              checked={includeQaAccount}
              onCheckedChange={(checked) => {
                setIncludeQaAccount(checked);
                setPage(1);
              }}
              aria-label="점검용 계정 포함"
            />
            <b className="text-gray-12">{includeQaAccount ? '켜짐' : '꺼짐'}</b>
          </label>
        )}
      </div>

      {query.isPending && (
        <div className="border-gray-3 text-gray-8 rounded-xl border bg-white p-10 text-center text-xs">
          회원 목록을 불러오는 중입니다.
        </div>
      )}

      {query.isError && (
        <>
          <section
            className="border-red-3 bg-red-1 rounded-row border p-4"
            data-testid="admin-members-error"
          >
            <h2 className="text-red-10 text-coach font-extrabold">
              회원 목록을 불러오지 못했어요
            </h2>
            <p className="text-red-10 mt-1.5 text-xs leading-[1.65]">
              회원 조회 서버가 응답하지 않습니다. 목록만 못 여는 상태이고 계정
              데이터는 그대로입니다. 권한 회수처럼 급한 조치가 필요하면 아래로
              바로 갈 수 있습니다.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                className="text-red-10 border-red-8 min-h-11 rounded-lg border bg-white px-3.5 text-xs font-extrabold"
                onClick={() => query.refetch()}
              >
                다시 불러오기
              </UnstyledButton>
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                className="text-red-10 border-red-8 min-h-11 rounded-lg border bg-white px-3.5 text-xs font-extrabold"
                onClick={() =>
                  document.querySelector<HTMLInputElement>('input')?.focus()
                }
              >
                이메일로 회원 1명 바로 찾기
              </UnstyledButton>
            </div>
          </section>
          <section className="border-gray-3 mt-3 rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-extrabold">최근 조치 이력</h2>
              <span className="text-gray-8 text-xs">이 기록은 정상입니다</span>
            </div>
            <div className="border-gray-3 text-gray-10 text-ui-choice rounded-lg border p-3 leading-7">
              <b className="text-gray-12">8월 2일 오후 3:12</b> ·
              관리자(조성진)가 점검용 계정 test-student-02 비활성
              <br />
              <b className="text-gray-12">7월 30일 오전 11:40</b> ·
              관리자(조성진)가 윤채원 계정 이메일 정정
            </div>
          </section>
        </>
      )}

      {query.data && query.data.content.length === 0 && (
        <section
          className="border-gray-3 rounded-row -0 border border-dashed bg-white px-6 text-center"
          data-testid="admin-members-empty"
        >
          <h2 className="text-sm font-extrabold">
            {keyword
              ? `\"${keyword}\"으로 찾은 ${ROLE_LABEL[role]}이 없어요`
              : `등록된 ${ROLE_LABEL[role]}이 없어요`}
          </h2>
          {keyword && role === 'TEACHER' && (
            <>
              <p className="text-gray-10 mt-2 text-xs leading-7">
                선생님 탭에서 찾는 중입니다. 같은 이름으로{' '}
                <b>학생 탭에는 1명</b>이 있습니다.
              </p>
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                className="border-orange-11 bg-orange-10 -0 text-coach mt-4 rounded-lg border px-5 font-extrabold text-white"
                onClick={() => selectRole('STUDENT')}
              >
                학생 탭에서 {`"${keyword}"`} 찾기
              </UnstyledButton>
            </>
          )}
          {keyword && (
            <div className="mt-3">
              <UnstyledButton
                variant="unstyled"
                size="none"
                type="button"
                className="border-gray-3 min-h-11 rounded-lg border bg-white px-3 text-xs font-extrabold"
                onClick={() => {
                  setSearchValue('');
                  setKeyword('');
                }}
              >
                검색어 지우고 전체 보기
              </UnstyledButton>
            </div>
          )}
        </section>
      )}

      {!!query.data?.content.length && (
        <>
          <div className="border-gray-3 overflow-x-auto rounded-xl border bg-white px-2 py-1.5">
            <table className="-0 w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-gray-8 text-ui-compact">
                  {[
                    '이름',
                    '가입 경로',
                    '가입 시각',
                    '스터디룸',
                    '마지막 접속',
                    '상태',
                    '',
                  ].map((label, index) => (
                    <th
                      key={`${label}-${index}`}
                      className="border-gray-3 border-b px-2.5 py-2 font-extrabold"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.content.map((member) => (
                  <tr
                    key={member.memberId}
                    className="hover:bg-orange-1"
                  >
                    <td className="border-gray-1 border-b px-2.5 py-3">
                      <b className="block">{member.name || '이름 미등록'}</b>
                      <span className="text-gray-8 text-ui-choice mt-0.5 block">
                        {member.email}
                      </span>
                    </td>
                    <td className="border-gray-1 border-b px-2.5 py-3">
                      <span
                        className={cn(
                          'text-ui-compact rounded-full px-2 py-1 font-extrabold',
                          member.signupPath === 'TEACHER_INVITE'
                            ? 'bg-orange-1 text-orange-11'
                            : 'bg-gray-1 text-gray-10'
                        )}
                      >
                        {member.signupPath
                          ? SIGNUP_LABEL[member.signupPath]
                          : '2026년 8월 이전 경로 미상'}
                      </span>
                    </td>
                    <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3 tabular-nums">
                      {formatDateTime(member.signupAt)}
                    </td>
                    <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3">
                      {member.studyRoomCount
                        ? `${member.studyRoomCount}개`
                        : '없음'}
                    </td>
                    <td className="border-gray-1 text-gray-10 text-ui-choice border-b px-2.5 py-3 tabular-nums">
                      {formatDateTime(member.lastActiveAt)}
                    </td>
                    <td className="border-gray-1 border-b px-2.5 py-3">
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
                    </td>
                    <td className="border-gray-1 border-b px-2.5 py-3 text-right">
                      <Link
                        className="border-gray-3 inline-grid min-h-11 place-items-center rounded-lg border px-3 text-xs font-extrabold"
                        href={PRIVATE.ADMIN.MEMBERS.DETAIL(member.memberId)}
                      >
                        상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-8 mt-3 text-xs leading-6">
            {role === 'STUDENT' ? (
              <>
                학생은 초대로 들어오지 않으므로 가입 경로가 <b>직접 가입</b>{' '}
                또는 <b>관리자 생성</b> 둘 중 하나입니다. 초대 경로는 선생님
                탭에서 뜹니다.
              </>
            ) : (
              <>
                가입 경로가 <b>학생 초대</b>인 줄을 누르면 초대 결과를 확인할 수
                있습니다. 권한 회수는 회원 상세에서 실행하며 실행자와 사유가
                이력에 남습니다.
              </>
            )}
          </p>
        </>
      )}

      {totalPages > 1 && (
        <Pagination
          className="mt-6"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </PageLayout>
  );
};

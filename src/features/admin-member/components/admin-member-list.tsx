'use client';

import { useMemo, useState } from 'react';

import {
  type AdminMemberListItem,
  type AdminMemberRole,
} from '@/entities/member';
import { useImpersonateMember } from '@/features/impersonation/hooks/use-impersonation';
import { Pagination, SearchInput, Toggle } from '@/shared/components/ui';
import { cn } from '@/shared/lib';

import { useAdminMembers } from '../hooks/use-admin-members';

const PAGE_SIZE = 20;
const ROLE_TABS: Array<{ value: AdminMemberRole; label: string }> = [
  { value: 'STUDENT', label: '학생' },
  { value: 'TEACHER', label: '선생님' },
  { value: 'PARENT', label: '학부모' },
];

const ROLE_LABEL: Record<AdminMemberRole, string> = {
  STUDENT: '학생',
  TEACHER: '선생님',
  PARENT: '학부모',
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

const MemberAction = ({ member }: { member: AdminMemberListItem }) => {
  const mutation = useImpersonateMember();
  const displayName = member.name?.trim() || member.email;
  return (
    <button
      type="button"
      className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-semibold whitespace-nowrap text-orange-700 hover:bg-orange-100 disabled:opacity-60"
      disabled={mutation.isPending}
      onClick={() =>
        mutation.mutate({ memberId: member.memberId, name: displayName })
      }
      data-testid={`impersonate-member-${member.memberId}`}
    >
      {mutation.isPending ? '여는 중' : '이 사람 화면 보기'}
    </button>
  );
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
  const membersQuery = useAdminMembers(params);
  const totalPages = Math.ceil(
    (membersQuery.data?.totalElements ?? 0) / PAGE_SIZE
  );

  const changeRole = (nextRole: AdminMemberRole) => {
    setRole(nextRole);
    setPage(1);
  };

  const submitSearch = (value: string) => {
    setKeyword(value.trim());
    setPage(1);
  };

  return (
    <section className="tablet:px-8 desktop:px-10 mx-auto w-full max-w-[1440px] px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-extrabold text-gray-950">회원 관리</h1>
        <p className="text-sm text-gray-500">
          초대로 들어온 선생님은 자동 승인됩니다. 이 화면에서 가입 결과를
          확인합니다.
        </p>
      </div>

      <div className="mb-3 flex gap-1 border-b border-gray-200">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={cn(
              'border-b-2 px-5 py-3 text-sm font-semibold',
              role === tab.value
                ? 'border-orange-600 text-orange-700'
                : 'border-transparent text-gray-500'
            )}
            onClick={() => changeRole(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <SearchInput
          className="min-w-[240px] flex-1"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={submitSearch}
          placeholder="이름 또는 이메일로 검색"
        />
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-700">
          <span>점검용 계정 포함</span>
          <Toggle
            checked={includeQaAccount}
            onCheckedChange={(checked) => {
              setIncludeQaAccount(checked);
              setPage(1);
            }}
            aria-label="점검용 계정 포함"
          />
        </label>
      </div>

      {membersQuery.isPending && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          회원 목록을 불러오는 중입니다.
        </div>
      )}

      {membersQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="font-bold text-red-900">
            회원 목록을 불러오지 못했어요
          </h2>
          <p className="mt-2 text-sm text-red-700">
            목록 조회만 실패한 상태이며 계정 데이터는 변경되지 않았습니다.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800"
            onClick={() => membersQuery.refetch()}
          >
            다시 불러오기
          </button>
        </div>
      )}

      {membersQuery.data && membersQuery.data.content.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <h2 className="font-bold text-gray-900">
            {keyword
              ? `“${keyword}”으로 찾은 ${ROLE_LABEL[role]}이 없어요`
              : `등록된 ${ROLE_LABEL[role]}이 없어요`}
          </h2>
          {keyword && (
            <button
              type="button"
              className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                setSearchValue('');
                submitSearch('');
              }}
            >
              검색어 지우고 전체 보기
            </button>
          )}
        </div>
      )}

      {!!membersQuery.data?.content.length && (
        <>
          <div className="tablet:block hidden overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3">이름</th>
                  <th className="px-5 py-3">가입 경로</th>
                  <th className="px-5 py-3">가입 시각</th>
                  <th className="px-5 py-3">스터디룸</th>
                  <th className="px-5 py-3">마지막 접속</th>
                  <th className="px-5 py-3">상태</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {membersQuery.data.content.map((member) => (
                  <tr
                    key={member.memberId}
                    className="border-t border-gray-100"
                  >
                    <td className="px-5 py-4">
                      <strong className="block text-gray-950">
                        {member.name || '이름 미등록'}
                      </strong>
                      <span className="text-xs text-gray-500">
                        {member.email}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {member.signupPath ?? '2026년 8월 이전 경로 미상'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatDateTime(member.signupAt)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {member.studyRoomCount > 0
                        ? `${member.studyRoomCount}개`
                        : '없음'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatDateTime(member.lastActiveAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                        활성
                      </span>
                      {member.isQaAccount && (
                        <span className="ml-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">
                          점검용
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <MemberAction member={member} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tablet:hidden grid gap-3">
            {membersQuery.data.content.map((member) => (
              <article
                key={member.memberId}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-gray-950">
                      {member.name || '이름 미등록'}
                    </h2>
                    <p className="mt-0.5 text-xs break-all text-gray-500">
                      {member.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                    활성
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-gray-400">가입 시각</dt>
                    <dd className="mt-1 text-gray-700">
                      {formatDateTime(member.signupAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">스터디룸</dt>
                    <dd className="mt-1 text-gray-700">
                      {member.studyRoomCount}개
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end">
                  <MemberAction member={member} />
                </div>
              </article>
            ))}
          </div>
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
    </section>
  );
};

'use client';

import Link from 'next/link';

import type { UnitNoteNode } from '@/entities/unit-note';
import StudentDashboardHeader from '@/features/dashboard/components/header/student-header';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import { BookOpen, ChevronRight, RefreshCw } from 'lucide-react';

import { useUnitNoteLibraryQuery } from '../hooks/use-unit-note-query';

type SubjectGroup = {
  key: string;
  label: string;
  aliases: string[];
};

type SubjectSummary = SubjectGroup & {
  root: UnitNoteNode | null;
  unitCount: number;
  pageCount: number;
  problemPercent: number;
  notePercent: number;
};

const SUBJECT_GROUPS: SubjectGroup[] = [
  { key: 'ALGEBRA', label: '대수', aliases: ['ALGEBRA', 'MATH_1'] },
  {
    key: 'CALCULUS_1',
    label: '미적분Ⅰ',
    aliases: ['CALCULUS_1', 'MATH_2'],
  },
  {
    key: 'PROBABILITY_STATISTICS',
    label: '확률과 통계',
    aliases: ['PROBABILITY_STATISTICS'],
  },
];

const summarizeSubject = (
  subject: SubjectGroup,
  nodes: UnitNoteNode[]
): SubjectSummary => {
  const subjectNodes = nodes.filter((node) =>
    subject.aliases.includes(node.subject)
  );
  const roots = subjectNodes.filter((node) => node.depth === 0);
  const pageCount = subjectNodes.reduce((sum, node) => sum + node.pageCount, 0);
  const masteryTotal = subjectNodes.reduce(
    (sum, node) => sum + node.masteryScore,
    0
  );
  const problemPercent = subjectNodes.length
    ? Math.round(masteryTotal / subjectNodes.length)
    : 0;
  const notePercent = Math.min(40, pageCount * 3);

  return {
    ...subject,
    root: roots[0] ?? subjectNodes[0] ?? null,
    unitCount: subjectNodes.length,
    pageCount,
    problemPercent,
    notePercent,
  };
};

export const UnitNoteLibrary = () => {
  const libraryQuery = useUnitNoteLibraryQuery();
  const nodes = libraryQuery.data?.nodes ?? [];
  const subjects = SUBJECT_GROUPS.map((subject) =>
    summarizeSubject(subject, nodes)
  );

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <StudentDashboardHeader title="단권화 노트" />
      <main className="w-full p-4">
        <p className="text-gray-8 mb-3 text-xs">
          내 학습 › <b className="text-gray-12">단권화 노트</b>
        </p>

        <section className="border-gray-3 bg-gray-white rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-gray-12 text-base font-extrabold">
              단권화 노트
            </h1>
            <span className="text-gray-8 text-xs">
              배우는 순서 · 최근에 정리한 과목부터
            </span>
          </div>

          {libraryQuery.isPending ? (
            <div className="mt-4 space-y-2">
              <Skeleton.Block className="h-[58px] w-full rounded-lg" />
              <Skeleton.Block className="h-[58px] w-full rounded-lg" />
              <Skeleton.Block className="h-[58px] w-full rounded-lg" />
            </div>
          ) : libraryQuery.isError ? (
            <div
              className="border-red-2 bg-red-1 mt-4 flex items-center gap-3 rounded-lg border p-4"
              role="alert"
            >
              <RefreshCw
                size={18}
                className="text-red-8"
                aria-hidden
              />
              <p className="text-red-10 flex-1 text-xs font-bold">
                단권화 과목을 불러오지 못했어요
              </p>
              <Button
                size="xsmall"
                variant="outlined"
                onClick={() => void libraryQuery.refetch()}
              >
                다시 불러오기
              </Button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#e0e0e0]">
              {subjects.map((subject, index) => {
                const totalPercent = Math.min(
                  100,
                  subject.problemPercent + subject.notePercent
                );
                return (
                  <div
                    key={subject.key}
                    className={`grid min-h-[58px] items-center gap-3 py-2 md:grid-cols-[minmax(190px,1fr)_minmax(250px,1.2fr)_112px] ${index === 0 ? 'bg-orange-1 px-2' : 'px-2'}`}
                  >
                    <div className="min-w-0">
                      <p className="text-gray-12 text-sm font-extrabold">
                        {subject.label}
                      </p>
                      <p className="text-gray-8 mt-0.5 text-[11px]">
                        {subject.unitCount > 0
                          ? `${subject.unitCount}단원 · 내 노트 ${subject.pageCount}장`
                          : '아직 시작 전'}
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="bg-gray-2 flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-full"
                        role="img"
                        aria-label={`${subject.label} 문제 ${subject.problemPercent}퍼센트, 정리 ${subject.notePercent}퍼센트`}
                      >
                        <i
                          className="bg-orange-7 h-full"
                          style={{ width: `${subject.problemPercent}%` }}
                        />
                        <i
                          className="bg-orange-4 h-full"
                          style={{ width: `${subject.notePercent}%` }}
                        />
                      </span>
                      <b className="text-gray-9 w-9 text-right text-xs tabular-nums">
                        {totalPercent}%
                      </b>
                    </div>
                    {subject.root ? (
                      <Link
                        href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(
                          subject.root.nodeId
                        )}
                        className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border px-3 text-xs font-extrabold ${index === 0 ? 'border-orange-10 bg-orange-9 text-white' : 'border-gray-4 text-gray-10'}`}
                      >
                        {index === 0 ? '이어서 정리하기' : '열기'}
                        <ChevronRight
                          size={15}
                          aria-hidden
                        />
                      </Link>
                    ) : (
                      <span className="border-gray-3 text-gray-6 inline-flex min-h-11 items-center justify-center rounded-lg border text-xs font-bold">
                        준비 중
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-gray-8 mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <i className="bg-orange-7 size-2.5 rounded-sm" /> 문제 푼 것
            </span>
            <span className="flex items-center gap-1.5">
              <i className="bg-orange-4 size-2.5 rounded-sm" /> 개념 정리한 것
            </span>
            <span className="flex items-center gap-1.5">
              <i className="bg-gray-2 size-2.5 rounded-sm" /> 아직 비어 있는 곳
            </span>
          </div>
          <p className="text-gray-8 mt-2 text-[11px] leading-5">
            태블릿에서 쓴 굿노트 파일을 올려도 한 장으로 셉니다. 노트 안
            문제를 풀면 진한 색이, 개념을 정리하면 옅은 색이 늘어납니다.
          </p>
        </section>

        {!libraryQuery.isPending &&
          !libraryQuery.isError &&
          nodes.length === 0 && (
            <section className="border-gray-3 bg-gray-white mt-3 flex flex-col items-center rounded-xl border px-6 py-12 text-center">
              <BookOpen
                size={34}
                className="text-gray-5"
                aria-hidden
              />
              <h2 className="text-gray-12 mt-3 text-sm font-extrabold">
                아직 정리한 단원이 없어요
              </h2>
              <p className="text-gray-8 mt-1 text-xs">
                대수부터 펜으로 첫 장을 만들 수 있습니다.
              </p>
            </section>
          )}
      </main>
    </div>
  );
};

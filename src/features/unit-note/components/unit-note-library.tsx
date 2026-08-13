'use client';

import { useState } from 'react';

import Link from 'next/link';

import type { UnitNoteNode } from '@/entities/unit-note';
import { Skeleton } from '@/shared/components/loading';
import { Button, SegmentedProgress } from '@/shared/components/ui';
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

const subjectLabel = (subjectCode: string) =>
  SUBJECT_GROUPS.find((subject) => subject.aliases.includes(subjectCode))
    ?.label ?? subjectCode;

const selectRecentUnits = (nodes: UnitNoteNode[]) => {
  const unitNodes = nodes.filter(
    (node) => node.depth > 0 && node.pageCount > 0
  );
  const candidates = unitNodes.length
    ? unitNodes
    : nodes.filter((node) => node.pageCount > 0);

  return [...candidates]
    .sort((left, right) => right.pageCount - left.pageCount)
    .slice(0, 3);
};

export const UnitNoteLibrary = () => {
  const libraryQuery = useUnitNoteLibraryQuery();
  // 승인 디자인 v22 `sNoteSubjects` 2661: `최근 정리 순`(기본) / `약한 순`
  const [sort, setSort] = useState<'RECENT' | 'WEAK'>('RECENT');
  const nodes = libraryQuery.data?.nodes ?? [];
  const subjects = SUBJECT_GROUPS.map((subject) =>
    summarizeSubject(subject, nodes)
  ).sort((a, b) =>
    sort === 'WEAK'
      ? a.problemPercent - b.problemPercent
      : b.pageCount - a.pageCount
  );
  const recentUnits = selectRecentUnits(nodes);

  return (
    <div className="bg-system-background min-h-screen">
      <main className="w-full p-4">
        <p className="text-gray-8 mb-3 text-xs">
          내 학습 › <b className="text-gray-12">단권화 노트</b>
        </p>

        <section className="border-gray-3 bg-gray-white rounded-card p-card-pad border">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-gray-12 text-base font-extrabold">과목</h1>
            <span className="text-gray-8 text-xs">
              {sort === 'RECENT'
                ? '최근에 정리한 과목부터'
                : '숙련도가 낮은 과목부터'}
            </span>
            <div className="ml-auto flex gap-1.5">
              {(
                [
                  ['RECENT', '최근 정리 순'],
                  ['WEAK', '약한 순'],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  size="xsmall"
                  variant={sort === value ? 'secondary' : 'outlined'}
                  aria-pressed={sort === value}
                  onClick={() => setSort(value)}
                  data-testid={`unit-note-sort-${value.toLowerCase()}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {libraryQuery.isPending ? (
            <div className="mt-4 space-y-2">
              <Skeleton.Block className="h-14.5 w-full rounded-lg" />
              <Skeleton.Block className="h-14.5 w-full rounded-lg" />
              <Skeleton.Block className="h-14.5 w-full rounded-lg" />
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
            <div className="divide-gray-3 mt-4 divide-y">
              <div className="text-gray-8 gap-content-gap hidden grid-cols-12 px-2 pb-2 text-xs font-bold md:grid">
                <span className="md:col-span-5">과목</span>
                <span className="md:col-span-5">숙련도</span>
                <span className="md:col-span-2">정리</span>
              </div>
              {subjects.map((subject, index) => {
                const totalPercent = Math.min(
                  100,
                  subject.problemPercent + subject.notePercent
                );
                return (
                  <div
                    key={subject.key}
                    className={`min-h-row-min gap-content-gap grid items-center py-2 md:grid-cols-12 ${index === 0 ? 'bg-orange-1 px-2' : 'px-2'}`}
                  >
                    <div className="min-w-0 md:col-span-5">
                      <p className="text-gray-12 text-sm font-extrabold">
                        {subject.label}
                      </p>
                      <p className="text-gray-8 text-ui-choice mt-0.5">
                        {subject.unitCount > 0
                          ? `${subject.unitCount}단원 · 내 노트 ${subject.pageCount}장`
                          : '아직 시작 전'}
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 md:col-span-5">
                      <div className="min-w-0 flex-1">
                        <SegmentedProgress
                          primaryValue={subject.problemPercent}
                          secondaryValue={subject.notePercent}
                          label={`${subject.label} 문제 ${subject.problemPercent}퍼센트, 정리 ${subject.notePercent}퍼센트`}
                        />
                      </div>
                      <b className="text-gray-9 w-9 text-right text-xs tabular-nums">
                        {totalPercent}%
                      </b>
                    </div>
                    <div className="md:col-span-2">
                      {subject.root ? (
                        <Button
                          asChild
                          size="xsmall"
                          variant={index === 0 ? 'primary' : 'outlined'}
                          className="w-full gap-1"
                        >
                          <Link
                            href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(
                              subject.root.nodeId
                            )}
                          >
                            {index === 0 ? '이어서 정리하기' : '열기'}
                            <ChevronRight
                              size={15}
                              aria-hidden
                            />
                          </Link>
                        </Button>
                      ) : (
                        <span className="border-gray-3 text-gray-8 min-h-control-sm rounded-button inline-flex w-full items-center justify-center border text-xs font-bold">
                          아직 시작 전
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-gray-8 text-ui-choice mt-4 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
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
          <p className="text-gray-8 text-ui-choice mt-2 leading-5">
            태블릿에서 쓴 굿노트 파일을 올려도 한 장으로 셉니다. 노트 안 문제를
            풀면 진한 색이, 개념을 정리하면 옅은 색이 늘어납니다.
          </p>
        </section>

        {!libraryQuery.isPending &&
          !libraryQuery.isError &&
          recentUnits.length > 0 && (
            <section
              className="border-gray-3 bg-gray-white rounded-card p-card-pad mt-block-gap border"
              data-testid="unit-note-recent-section"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-gray-12 text-base font-extrabold">
                  최근에 쓴 정리
                </h2>
                <span className="text-gray-8 text-xs">
                  과목을 거치지 않고 바로 이어 쓰는 자리
                </span>
              </div>
              <div className="divide-gray-3 mt-3 divide-y">
                <div className="text-gray-8 gap-content-gap hidden grid-cols-12 px-2 pb-2 text-xs font-bold md:grid">
                  <span className="md:col-span-5">단원</span>
                  <span className="md:col-span-5">숙련도</span>
                  <span className="md:col-span-2">정리</span>
                </div>
                {recentUnits.map((unit, index) => (
                  <div
                    key={unit.nodeId}
                    className="min-h-row-min gap-content-gap grid items-center py-2 md:grid-cols-12"
                  >
                    <div className="min-w-0 md:col-span-5">
                      <p className="text-gray-12 text-sm font-extrabold">
                        {unit.displayName || unit.unit}
                      </p>
                      <p className="text-gray-8 text-ui-choice mt-0.5">
                        {subjectLabel(unit.subject)} · 노트 {unit.pageCount}장
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 md:col-span-5">
                      <div className="min-w-0 flex-1">
                        <SegmentedProgress
                          primaryValue={unit.masteryScore}
                          label={`${unit.displayName || unit.unit} 단원 숙련도 ${unit.masteryScore}퍼센트`}
                        />
                      </div>
                      <b className="text-gray-9 w-9 text-right text-xs tabular-nums">
                        {unit.masteryScore}%
                      </b>
                    </div>
                    <Button
                      asChild
                      size="xsmall"
                      variant={index === 0 ? 'primary' : 'outlined'}
                      className="w-full md:col-span-2"
                    >
                      <Link
                        href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(unit.nodeId)}
                      >
                        {index === 0 ? '이어 쓰기' : '열기'}
                        <ChevronRight
                          size={15}
                          aria-hidden
                        />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

        {!libraryQuery.isPending && !libraryQuery.isError && (
          <p className="bg-gray-1 text-gray-9 rounded-row p-card-pad mt-block-gap text-xs leading-5">
            막대의 단원 숙련도는 오픈챌린지의 약점 나무가 계산합니다. 단권화는
            그 값을 받아 노트 옆에 보여줍니다.
          </p>
        )}

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

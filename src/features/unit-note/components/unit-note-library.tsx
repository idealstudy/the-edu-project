'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import type { UnitNoteNode } from '@/entities/unit-note';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import { BookOpen, ChevronRight, RefreshCw } from 'lucide-react';

import { useUnitNoteLibraryQuery } from '../hooks/use-unit-note-query';
import { UnitNoteLeaf } from './unit-note-leaf';

type SubjectKey =
  | 'MIDDLE_MATH'
  | 'COMMON_MATH_1'
  | 'COMMON_MATH_2'
  | 'ALGEBRA'
  | 'CALCULUS_1'
  | 'CALCULUS_2'
  | 'MATH_1'
  | 'MATH_2'
  | 'CALCULUS'
  | 'PROBABILITY_STATISTICS';

type BranchSummary = UnitNoteNode & {
  branchPageCount: number;
  branchProblemCount: number;
  branchHintFreeCount: number;
  branchLevel: UnitNoteNode['leafLevel'];
};

const SUBJECTS: { key: SubjectKey; label: string }[] = [
  { key: 'MIDDLE_MATH', label: '중학' },
  { key: 'COMMON_MATH_1', label: '공통수학1' },
  { key: 'COMMON_MATH_2', label: '공통수학2' },
  { key: 'ALGEBRA', label: '대수' },
  { key: 'CALCULUS_1', label: '미적분Ⅰ' },
  { key: 'CALCULUS_2', label: '미적분Ⅱ' },
  { key: 'MATH_1', label: '대수' },
  { key: 'MATH_2', label: '미적분Ⅰ' },
  { key: 'CALCULUS', label: '미적분Ⅱ' },
  { key: 'PROBABILITY_STATISTICS', label: '확률과 통계' },
];

const summarizeBranch = (
  root: UnitNoteNode,
  nodes: UnitNoteNode[]
): BranchSummary => {
  const branch = [
    root,
    ...nodes.filter((node) => node.parentId === root.nodeId),
  ];
  const branchPageCount = branch.reduce(
    (total, node) => total + node.pageCount,
    0
  );
  const branchProblemCount = branch.reduce(
    (total, node) => total + node.relatedProblemCount,
    0
  );
  const branchHintFreeCount = branch.reduce(
    (total, node) => total + node.hintFreeSolveCount,
    0
  );
  const branchLevel = branch.some((node) => node.leafLevel === 'DEEP')
    ? 'DEEP'
    : branch.some((node) => node.leafLevel === 'LIT')
      ? 'LIT'
      : 'GRAY';
  return {
    ...root,
    branchPageCount,
    branchProblemCount,
    branchHintFreeCount,
    branchLevel,
  };
};

export const UnitNoteLibrary = () => {
  const libraryQuery = useUnitNoteLibraryQuery();
  const [subject, setSubject] = useState<SubjectKey>('MATH_1');

  const availableSubjects = useMemo(() => {
    const nodes = libraryQuery.data?.nodes ?? [];
    const subjects = new Set(nodes.map((node) => node.subject));
    return SUBJECTS.filter((item) => subjects.has(item.key));
  }, [libraryQuery.data?.nodes]);

  useEffect(() => {
    if (
      availableSubjects.length > 0 &&
      !availableSubjects.some((item) => item.key === subject)
    ) {
      setSubject(availableSubjects[0]!.key);
    }
  }, [availableSubjects, subject]);

  const roots = useMemo(() => {
    const nodes = libraryQuery.data?.nodes ?? [];
    return nodes
      .filter((node) => node.subject === subject && node.depth === 0)
      .map((node) => summarizeBranch(node, nodes));
  }, [libraryQuery.data?.nodes, subject]);

  if (libraryQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-4 py-8">
        <Skeleton.Block className="h-28 w-full rounded-xl" />
        <Skeleton.Block className="mt-5 h-[420px] w-full rounded-xl" />
      </div>
    );
  }

  if (libraryQuery.isError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="text-gray-6 mx-auto"
          />
          <h1 className="font-headline2-heading text-gray-12 mt-3">
            단권화 트리를 불러오지 못했어요
          </h1>
          <Button
            className="mt-5"
            variant="outlined"
            onClick={() => void libraryQuery.refetch()}
          >
            다시 불러오기
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-system-background min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <header className="border-gray-3 bg-gray-white rounded-xl border p-5 md:p-7">
          <div className="flex items-center gap-3">
            <BookOpen
              size={28}
              className="text-orange-7"
              aria-hidden
            />
            <div>
              <h1 className="font-title-heading text-gray-12">단권화</h1>
              <p className="font-body2-normal text-gray-8 mt-1">
                단원을 누르면 선생님 판서·내 노트·관련 문제가 쌓인 방이 열려요.
              </p>
            </div>
          </div>
          <div className="border-orange-3 bg-orange-1 mt-5 rounded-lg border px-4 py-3">
            <p className="font-body2-heading text-orange-10">
              노트를 쓰면 잎에 색이 생기고, 문제를 힌트 없이 풀수록 짙어져요.
            </p>
          </div>
        </header>

        <nav
          className="mt-5 flex gap-2 overflow-x-auto pb-2"
          aria-label="수학 과목"
          data-testid="unit-note-subject-tabs"
        >
          {availableSubjects.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`font-label-heading min-h-11 shrink-0 cursor-pointer rounded-full border px-4 ${
                subject === item.key
                  ? 'border-orange-7 bg-orange-7 text-white'
                  : 'border-gray-3 bg-gray-white text-gray-8 hover:bg-gray-1'
              }`}
              aria-pressed={subject === item.key}
              onClick={() => setSubject(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section
          className="border-gray-3 bg-gray-white mt-3 rounded-xl border p-4 md:p-6"
          aria-label="단권화 단원 트리"
        >
          {roots.length === 0 ? (
            <div className="py-14 text-center">
              <BookOpen
                size={34}
                className="text-gray-5 mx-auto"
              />
              <p className="font-body1-heading text-gray-11 mt-3">
                이 과목의 단원 시드를 준비하고 있어요.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {roots.map((node) => (
                <Link
                  key={node.nodeId}
                  href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(node.nodeId)}
                  className="border-gray-3 hover:border-orange-5 hover:bg-orange-1 flex min-h-[104px] items-center gap-4 rounded-xl border p-4 transition-colors"
                  data-testid={`unit-note-root-${node.nodeId}`}
                >
                  <UnitNoteLeaf level={node.branchLevel} />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-body1-heading text-gray-12">
                      {node.displayName}
                    </h2>
                    <p className="font-caption-normal text-gray-8 mt-1">
                      내 노트 {node.branchPageCount}장 · 관련 문제{' '}
                      {node.branchProblemCount}개
                      {node.branchHintFreeCount > 0
                        ? ` · 힌트 없이 해결 ${node.branchHintFreeCount}`
                        : ''}
                    </p>
                  </div>
                  <span className="font-label-heading text-orange-9 flex items-center gap-1">
                    방 열기
                    <ChevronRight
                      size={18}
                      aria-hidden
                    />
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="font-caption-normal text-gray-7 mt-5 flex flex-wrap gap-4">
            <span className="flex items-center gap-2">
              <UnitNoteLeaf
                level="GRAY"
                className="size-5"
              />
              무채색 · 노트 없음
            </span>
            <span className="flex items-center gap-2">
              <UnitNoteLeaf
                level="LIT"
                className="size-5"
              />
              색 생김 · 노트 있음
            </span>
            <span className="flex items-center gap-2">
              <UnitNoteLeaf
                level="DEEP"
                className="size-5"
              />
              짙음 · 문제 해결 누적
            </span>
          </div>
        </section>
      </div>
    </main>
  );
};

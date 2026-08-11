'use client';

import Link from 'next/link';

import { SegmentedProgress } from '@/shared/components/ui/segmented-progress';
import { PRIVATE } from '@/shared/constants/route';
import { ChevronRight, RefreshCw } from 'lucide-react';

import { useUnitNoteLibraryQuery } from '../hooks/use-unit-note-query';

export const UnitNoteEntryCard = () => {
  const libraryQuery = useUnitNoteLibraryQuery();
  const subjectOrder = ['ALGEBRA', 'CALCULUS_1', 'PROBABILITY_STATISTICS'];
  const subjectLabels: Record<string, string> = {
    ALGEBRA: '대수',
    MATH_1: '대수',
    CALCULUS_1: '미적분Ⅰ',
    MATH_2: '미적분Ⅰ',
    PROBABILITY_STATISTICS: '확률과 통계',
  };
  const nodes = libraryQuery.data?.nodes ?? [];
  const normalizedSubjects = subjectOrder.map((subject) => {
    const aliases =
      subject === 'ALGEBRA'
        ? ['ALGEBRA', 'MATH_1']
        : subject === 'CALCULUS_1'
          ? ['CALCULUS_1', 'MATH_2']
          : [subject];
    const subjectNodes = nodes.filter((node) => aliases.includes(node.subject));
    const totalMastery = subjectNodes.reduce(
      (sum, node) => sum + node.masteryScore,
      0
    );
    const solvedPercent = subjectNodes.length
      ? Math.round(totalMastery / subjectNodes.length)
      : 0;
    const totalPages = subjectNodes.reduce(
      (sum, node) => sum + node.pageCount,
      0
    );
    const notedPercent = Math.min(40, totalPages * 3);
    return {
      subject,
      label: subjectLabels[subject] ?? subject,
      unitCount: subjectNodes.length,
      // 정리 기록 유무는 단원 개수가 아니라 실제로 쓴 노트 쪽수로 판정한다.
      noteCount: totalPages,
      solvedPercent,
      notedPercent,
      totalPercent: Math.min(100, solvedPercent + notedPercent),
    };
  });

  return (
    <section
      className="border-gray-3 bg-gray-white p-card-pad rounded-card border"
      data-testid="unit-note-entry-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-gray-12 text-base font-extrabold">단권화 노트</h2>
          <p className="text-gray-7 mt-0.5 text-xs">
            최근에 정리한 순서 · 3과목
          </p>
        </div>
        <Link
          href={PRIVATE.DASHBOARD.UNIT_NOTES}
          className="border-gray-4 text-gray-9 hover:border-orange-6 hover:text-orange-9 min-h-control-sm rounded-button px-button-compact-x flex items-center gap-1 border text-xs font-bold"
        >
          단권화 열기
          <ChevronRight
            size={15}
            aria-hidden
          />
        </Link>
      </div>

      {libraryQuery.isError ? (
        <div className="border-system-warning bg-system-warning-alt p-card-pad rounded-card mt-4 flex items-center gap-3 border">
          <RefreshCw
            size={18}
            className="text-system-warning-text"
            aria-hidden
          />
          <p className="text-system-warning-text flex-1 text-xs font-bold">
            단권화 현황을 불러오지 못했어요
          </p>
          <button
            type="button"
            className="border-system-warning text-system-warning-text min-h-control-sm rounded-button px-button-compact-x cursor-pointer border bg-white text-xs font-bold"
            onClick={() => void libraryQuery.refetch()}
          >
            다시 불러오기
          </button>
        </div>
      ) : (
        <div className="divide-gray-3 mt-4 divide-y">
          {normalizedSubjects.map((subject, index) => (
            <div
              key={subject.subject}
              className="min-h-row-min gap-content-gap grid items-center py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_8rem]"
            >
              <div>
                <p className="text-gray-12 text-sm font-extrabold">
                  {subject.label}
                </p>
                {/*
                  정리 기록은 노트 쪽수로 판정한다. 단원 트리만 있고 쪽수가 0 이면
                  정리한 적이 없는 것인데 예전에는 "마지막 정리 기록 있음"으로 나와
                  진행률 0% 와 어긋났다(fix-report-v8-2 곁다리 관찰).
                */}
                <p className="text-gray-7 text-ui-choice mt-0.5">
                  {subject.unitCount === 0
                    ? '아직 시작 전'
                    : subject.noteCount > 0
                      ? `${subject.unitCount}단원 · 정리한 노트 ${subject.noteCount}쪽`
                      : `${subject.unitCount}단원 · 아직 정리한 노트 없음`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <SegmentedProgress
                    primaryValue={subject.solvedPercent}
                    secondaryValue={subject.notedPercent}
                    label={`${subject.label} 문제 ${subject.solvedPercent}퍼센트, 정리 ${subject.notedPercent}퍼센트`}
                  />
                </div>
                <span className="text-gray-8 w-9 text-right text-xs font-bold tabular-nums">
                  {subject.totalPercent}%
                </span>
              </div>
              <Link
                href={PRIVATE.DASHBOARD.UNIT_NOTES}
                className={`min-h-control-sm rounded-button px-button-compact-x inline-flex items-center justify-center border text-center text-xs font-bold ${
                  index === 0
                    ? 'border-orange-7 bg-orange-7 text-white'
                    : 'border-gray-4 text-gray-9'
                }`}
              >
                {index === 0 ? '이어서 정리하기' : '열기'}
              </Link>
            </div>
          ))}
        </div>
      )}
      <div className="text-gray-7 text-ui-choice mt-3 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
        <span className="flex items-center gap-1.5">
          <i className="bg-orange-7 size-2.5 rounded-sm" /> 문제 푼 것
        </span>
        <span className="flex items-center gap-1.5">
          <i className="bg-orange-4 size-2.5 rounded-sm" /> 개념 정리한 것
        </span>
        <span className="flex items-center gap-1.5">
          <i className="bg-gray-3 size-2.5 rounded-sm" /> 아직 비어 있는 곳
        </span>
        <span>
          노트 안 문제를 풀면 진한 색이, 개념을 정리하면 옅은 색이 늡니다
        </span>
      </div>
    </section>
  );
};

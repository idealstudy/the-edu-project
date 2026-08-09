'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import type { TreeSubjectGroup } from '@/entities/tree';
import { useStudentGrowthQuery } from '@/features/dashboard/hooks/use-growth-query';
import { useMyPointWalletQuery } from '@/features/point/hooks/use-point';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { Button } from '@/shared/components/ui';
import { subjectLabel } from '@/shared/constants';
import { PRIVATE } from '@/shared/constants/route';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * v22 §3.6 학습 지도 타일(:1315-1317, :1461): 한 줄 최대 5칸(휴대폰 2칸),
 * 타일 최소 높이 74px, gap 8px. 6칸 이상 금지.
 */
const TILE_GRID = 'grid grid-cols-2 gap-2 md:grid-cols-5';

/**
 * v22 §8 R1: 지도 규격은 3과목 18단원 전제인데 실제 DB 는 7과목 22대단원이다.
 * v22 가 접기 규칙을 안 정했으므로, v22 가 0건 상태에서 쓴 방식(:2383 "미적분Ⅰ과
 * 확률과 통계 칸은 접어 뒀어요")을 전 과목으로 확장했다. 손댄 과목은 펼치고
 * 아직 한 칸도 안 찬 과목은 접는다. 접힌 줄은 진행 막대와 함께 남아 눌러서 편다.
 */
const shouldOpenByDefault = (group: TreeSubjectGroup) =>
  group.nodes.some((node) => node.masteryScore > 0);

const tileTone = (masteryScore: number) => {
  if (masteryScore >= 80) return 'bg-orange-7';
  if (masteryScore >= 60) return 'bg-orange-4';
  if (masteryScore > 0) return 'bg-orange-2';
  return 'bg-gray-1';
};

export const StudentResultsPage = () => {
  const treeQuery = useMyTreeQuery();
  const growthQuery = useStudentGrowthQuery();
  const pointQuery = useMyPointWalletQuery();
  const tree = treeQuery.data;
  const groups = useMemo(() => tree?.groups ?? [], [tree?.groups]);
  const nodes = groups.flatMap((group) => group.nodes);
  const weakUnits = [...nodes]
    .filter((node) => node.masteryScore > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 3);
  const isEmpty =
    nodes.length === 0 || nodes.every((node) => node.masteryScore === 0);

  const defaultOpen = useMemo(() => {
    const opened = groups
      .filter(shouldOpenByDefault)
      .map((group) => group.subject as string);
    if (opened.length > 0) return opened;
    const first = groups[0]?.subject as string | undefined;
    return first ? [first] : [];
  }, [groups]);
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});
  const isOpen = (subject: string) =>
    manualOpen[subject] ?? defaultOpen.includes(subject);
  const toggle = (subject: string) =>
    setManualOpen((prev) => ({ ...prev, [subject]: !isOpen(subject) }));
  const foldedCount = groups.filter(
    (group) => !isOpen(group.subject as string)
  ).length;

  return (
    <main className="flex w-full flex-col gap-block-gap p-section-gap">
      <section
        className="border-gray-3 bg-gray-white rounded-xl border p-4"
        data-testid="learning-map"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-gray-12 text-base font-extrabold">
            내 학습 지도
          </h2>
          <span className="text-gray-9 text-xs">
            {groups.length}과목 {nodes.length}단원 · 지금까지 채운 것
          </span>
          <span className="border-gray-3 text-gray-10 ml-auto rounded-md border px-2 py-1 text-[11px] font-bold">
            최근 바뀐 순
          </span>
        </div>

        {treeQuery.isError ? (
          <div className="border-red-3 bg-red-1 rounded-lg border p-8 text-center">
            <b className="text-red-10">학습 지도를 불러오지 못했어요</b>
            <Button
              size="xsmall"
              variant="outlined"
              className="ml-3"
              onClick={() => void treeQuery.refetch()}
            >
              다시 불러오기
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-gray-1 mb-5 grid grid-cols-2 gap-2 rounded-lg p-3 md:grid-cols-4">
              <MapStat
                value={tree?.mastery.mastered ?? 0}
                label="정복한 단원"
              />
              <MapStat
                value={tree?.mastery.inProgress ?? 0}
                label="진행 중"
              />
              <MapStat
                value={tree?.mastery.untested ?? 0}
                label="미진단"
              />
              <div>
                <p className="text-gray-9 mb-2 text-xs">
                  지도 전체가{' '}
                  <b className="text-gray-12 tabular-nums">
                    {tree?.mastery.averageScore ?? 0}%
                  </b>{' '}
                  찼어요
                </p>
                {/* v22 §3.4 레벨 막대(.lvbar) 높이 9px */}
                <div className="bg-gray-2 h-[9px] overflow-hidden rounded-full">
                  <i
                    className="bg-orange-7 block h-full rounded-full"
                    style={{ width: `${tree?.mastery.averageScore ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {groups.map((group) => {
                const subject = group.subject as string;
                const masteredCount = group.nodes.filter(
                  (node) => node.masteryScore >= 80
                ).length;
                const groupPercent = group.nodes.length
                  ? Math.round((masteredCount / group.nodes.length) * 100)
                  : 0;
                const opened = isOpen(subject);
                return (
                  <div
                    key={subject}
                    data-testid={`learning-map-group-${subject}`}
                  >
                    {/* v22 §3.4 그룹 진행 막대(.tgbar) 높이 6px, 최대 폭 220px */}
                    <button
                      type="button"
                      aria-expanded={opened}
                      onClick={() => toggle(subject)}
                      data-testid={`learning-map-group-toggle-${subject}`}
                      className="mb-2 flex min-h-11 w-full cursor-pointer items-center gap-2.5 text-left"
                    >
                      {opened ? (
                        <ChevronDown
                          size={16}
                          className="text-gray-9"
                          aria-hidden
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                          className="text-gray-9"
                          aria-hidden
                        />
                      )}
                      <h3 className="text-gray-12 text-[13px] font-extrabold">
                        {subjectLabel(subject)}
                      </h3>
                      <span className="text-gray-9 text-[11px] font-extrabold tabular-nums">
                        {masteredCount} / {group.nodes.length} 정복
                      </span>
                      <span className="bg-gray-2 h-1.5 max-w-[220px] flex-1 overflow-hidden rounded-full">
                        <i
                          className="bg-orange-7 block h-full"
                          style={{ width: `${groupPercent}%` }}
                        />
                      </span>
                    </button>
                    {opened && (
                      <div className={TILE_GRID}>
                        {group.nodes.map((node) => (
                          <Link
                            key={node.nodeId}
                            href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(
                              Number(node.nodeId)
                            )}
                            className={`border-gray-3 bg-gray-white relative flex min-h-[74px] flex-col justify-end gap-1 overflow-hidden rounded-lg border p-2.5 text-left ${
                              node.masteryScore === 0 ? 'border-dashed' : ''
                            }`}
                          >
                            <span
                              className={`absolute inset-x-0 bottom-0 ${tileTone(node.masteryScore)}`}
                              style={{ height: `${node.masteryScore}%` }}
                            />
                            <span className="text-gray-12 relative block text-[11.5px] font-bold break-keep">
                              {node.displayName}
                            </span>
                            <span className="text-gray-10 relative block text-[11px] font-extrabold tabular-nums">
                              {node.masteryScore > 0
                                ? `${node.masteryScore}%`
                                : '미진단'}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="bg-gray-1 text-gray-10 mt-4 rounded-lg p-3 text-xs leading-5">
              칸을 누르면 그 단원 <b>단권화 노트</b>로 갑니다. 여기서는 보기만
              하고 고치지 않습니다. 숙련도 값은 <b>오픈챌린지</b>에서
              가져옵니다.
              {foldedCount > 0 && (
                <>
                  {' '}
                  아직 한 칸도 안 찬 과목 <b>{foldedCount}개</b>는 접어 뒀어요.
                  과목 줄을 누르면 펼쳐집니다.
                </>
              )}
            </p>
            {isEmpty && (
              <Button
                asChild
                size="small"
                className="mt-3 w-full"
              >
                <Link href={PRIVATE.DASHBOARD.STUDENT}>
                  내 학습으로 가서 첫 문제 풀기
                </Link>
              </Button>
            )}
          </>
        )}
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {!isEmpty && (
          <section className="border-gray-3 bg-gray-white rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-gray-12 text-base font-extrabold">
                약한 단원
              </h2>
              <span className="text-gray-9 text-xs">
                지도에서 가장 덜 찬 곳 셋
              </span>
            </div>
            {weakUnits.map((unit) => (
              <div
                key={unit.nodeId}
                className="border-gray-2 flex min-h-[58px] items-center gap-3 border-t py-2 first:border-t-0"
              >
                <div className="min-w-0 flex-1">
                  <b className="text-gray-12 block truncate text-sm">
                    {unit.displayName}
                  </b>
                  <small className="text-gray-9">
                    노트 {unit.unitNotePageCount}장
                  </small>
                </div>
                <div className="flex w-48 items-center gap-2">
                  <span className="bg-gray-2 h-2 flex-1 overflow-hidden rounded-full">
                    <i
                      className="bg-orange-7 block h-full"
                      style={{ width: `${unit.masteryScore}%` }}
                    />
                  </span>
                  <b className="text-gray-10 w-11 text-right text-xs tabular-nums">
                    {unit.masteryScore}%
                  </b>
                </div>
                <Button
                  asChild
                  size="xsmall"
                  variant="outlined"
                >
                  <Link
                    href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(Number(unit.nodeId))}
                  >
                    정리하기
                  </Link>
                </Button>
              </div>
            ))}
          </section>
        )}
        <section className="border-gray-3 bg-gray-white rounded-xl border p-4">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-gray-12 text-base font-extrabold">
              뱃지 · 포인트 · 레벨
            </h2>
            <span className="text-gray-9 text-xs">
              오픈챌린지와 같은 계정에서 쌓입니다
            </span>
          </div>
          <div className="bg-gray-1 rounded-lg p-4">
            <div className="flex items-end justify-between">
              <b className="text-gray-12 text-xl">
                Lv.{growthQuery.data?.level ?? 0}
              </b>
              <span className="text-gray-9 text-xs">
                다음 레벨까지 {growthQuery.data?.xpToNextLevel ?? 0}포인트
              </span>
            </div>
            <div className="bg-gray-2 mt-3 h-[9px] overflow-hidden rounded-full">
              <i
                className="bg-orange-7 block h-full"
                style={{
                  width: `${growthQuery.data ? Math.min(100, Math.round((growthQuery.data.xp / growthQuery.data.xpToNextLevel) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="border-gray-2 my-4 flex items-center border-y py-3">
            <span className="text-gray-12 text-sm">쓸 수 있는 포인트</span>
            <b className="text-orange-10 ml-auto text-xl tabular-nums">
              {pointQuery.data?.balance ?? 0}P
            </b>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              ['첫 정복', (tree?.mastery.mastered ?? 0) >= 1],
              ['7일 연속', (growthQuery.data?.streakDays ?? 0) >= 7],
              ['오답 10개 정리', false],
              ['해설 없이 10문항', false],
              ['30일 연속', (growthQuery.data?.streakDays ?? 0) >= 30],
              ['단원 정복 5개', (tree?.mastery.mastered ?? 0) >= 5],
            ].map(([label, earned]) => (
              <div
                key={String(label)}
                className="border-gray-3 rounded-xl border p-3 text-center"
              >
                <span
                  className={`block text-lg ${earned ? 'text-orange-7' : 'text-gray-5'}`}
                >
                  {earned ? '★' : '☆'}
                </span>
                <b className="text-gray-12 text-[11px]">{label}</b>
                {!earned && (
                  <small className="text-gray-9 block text-[10px]">잠김</small>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

const MapStat = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <strong className="text-gray-12 block text-xl tabular-nums">{value}</strong>
    <span className="text-gray-9 text-[11px]">{label}</span>
  </div>
);

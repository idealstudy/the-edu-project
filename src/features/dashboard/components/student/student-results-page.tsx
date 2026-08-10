'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import type { TreeSubjectGroup } from '@/entities/tree';
import { useStudentGrowthQuery } from '@/features/dashboard/hooks/use-growth-query';
import { useMyPointWalletQuery } from '@/features/point/hooks/use-point';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { PageLayout, SplitLayout } from '@/layout';
import { Button, Card } from '@/shared/components/ui';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { subjectLabel } from '@/shared/constants';
import { PRIVATE } from '@/shared/constants/route';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * v22 §3.6 학습 지도 타일(:1315-1317, :1461): 한 줄 최대 5칸(휴대폰 2칸),
 * 타일 최소 높이 74px, gap 8px. 6칸 이상 금지.
 */
const TILE_GRID = 'grid grid-cols-2 gap-2 md:grid-cols-5';

/**
 * v22 §5의 768px 접힘선과 §8 R1의 대량 데이터 위험을 실제 9과목 73단원에 맞춘다.
 * 기본 펼침은 한 과목뿐이다. 아직 정복하지 못했고 실제 풀이 이력이 있는 단원이
 * 많은 과목을 우선하고, 동률이면 그 단원들의 풀이 수, 전체 풀이 수, 서버 과목
 * 순서를 차례로 쓴다. API에 최근 수정 시각이 없으므로 누적 풀이를 최근성처럼
 * 가장하지 않는다. 학생은 모든 과목 머리줄을 눌러 추가로 펼칠 수 있다.
 */
export const selectDefaultOpenSubjects = (groups: TreeSubjectGroup[]) => {
  const ranked = groups
    .map((group, index) => {
      const activeNodes = group.nodes.filter(
        (node) => node.attemptCount > 0 && node.masteryScore < 80
      );
      return {
        subject: group.subject as string,
        activeNodeCount: activeNodes.length,
        activeAttemptCount: activeNodes.reduce(
          (sum, node) => sum + node.attemptCount,
          0
        ),
        totalAttemptCount: group.nodes.reduce(
          (sum, node) => sum + node.attemptCount,
          0
        ),
        index,
      };
    })
    .sort(
      (a, b) =>
        b.activeNodeCount - a.activeNodeCount ||
        b.activeAttemptCount - a.activeAttemptCount ||
        b.totalAttemptCount - a.totalAttemptCount ||
        a.index - b.index
    );

  return ranked[0] ? [ranked[0].subject] : [];
};

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
    return selectDefaultOpenSubjects(groups);
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
    <PageLayout className="gap-block-gap flex flex-col">
      <Card data-testid="learning-map">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-gray-12 text-base font-extrabold">
            내 학습 지도
          </h2>
          <span className="text-gray-9 text-xs">
            {groups.length}과목 {nodes.length}단원 · 지금까지 채운 것
          </span>
          <span className="border-gray-3 text-gray-10 text-ui-choice ml-auto rounded-md border px-2 py-1 font-bold">
            진행 중 1과목 먼저
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
                <div className="bg-gray-2 h-level-bar rounded-pill overflow-hidden">
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
                    <UnstyledButton
                      variant="unstyled"
                      size="none"
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
                      <h3 className="text-gray-12 font-label-heading text-heading-wrap">
                        {subjectLabel(subject)}
                      </h3>
                      <span className="text-gray-9 font-caption-heading numeric-tabular">
                        {masteredCount} / {group.nodes.length} 정복
                      </span>
                      <span className="bg-gray-2 max-w-tree-progress-max rounded-pill h-1.5 flex-1 overflow-hidden">
                        <i
                          className="bg-orange-7 block h-full"
                          style={{ width: `${groupPercent}%` }}
                        />
                      </span>
                    </UnstyledButton>
                    {opened && (
                      <div className={TILE_GRID}>
                        {group.nodes.map((node) => (
                          <Link
                            key={node.nodeId}
                            href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(
                              Number(node.nodeId)
                            )}
                            className={`border-gray-3 bg-gray-white min-h-tree-tile-min rounded-button relative flex min-w-0 flex-col justify-end gap-1 overflow-hidden border p-2.5 text-left ${
                              node.masteryScore === 0 ? 'border-dashed' : ''
                            }`}
                          >
                            <span
                              className={`absolute inset-x-0 bottom-0 ${tileTone(node.masteryScore)}`}
                              style={{ height: `${node.masteryScore}%` }}
                            />
                            <span className="text-gray-12 font-caption-heading text-two-lines relative block">
                              {node.displayName}
                            </span>
                            <span className="text-gray-10 font-caption-heading numeric-tabular relative block">
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
                  나머지 <b>{foldedCount}과목</b>은 접어 뒀어요. 처음에는{' '}
                  {isEmpty
                    ? '첫 과목 하나만'
                    : '아직 정복하지 못한 풀이가 가장 많은 과목 하나만'}{' '}
                  펼칩니다. 과목 줄을 누르면 더 볼 수 있어요.
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
      </Card>

      <SplitLayout>
        {!isEmpty && (
          <Card>
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
                className="border-gray-2 min-h-row-min flex min-w-0 items-center gap-3 border-t py-2 first:border-t-0"
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
          </Card>
        )}
        <Card>
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
            <div className="bg-gray-2 h-level-bar rounded-pill mt-3 overflow-hidden">
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
          <div className="gap-content-gap grid grid-cols-3">
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
                className="border-gray-3 rounded-card p-content-gap min-w-0 border text-center"
              >
                <span
                  className={`block text-lg ${earned ? 'text-orange-7' : 'text-gray-5'}`}
                >
                  {earned ? '★' : '☆'}
                </span>
                <b className="text-gray-12 font-caption-heading text-heading-wrap block">
                  {label}
                </b>
                {!earned && (
                  <small className="text-gray-9 text-ui-compact block">
                    잠김
                  </small>
                )}
              </div>
            ))}
          </div>
        </Card>
      </SplitLayout>
    </PageLayout>
  );
};

const MapStat = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <strong className="text-gray-12 block text-xl tabular-nums">{value}</strong>
    <span className="text-gray-9 text-ui-choice">{label}</span>
  </div>
);

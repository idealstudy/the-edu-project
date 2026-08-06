'use client';

import Link from 'next/link';

import { useStudentGrowthQuery } from '@/features/dashboard/hooks/use-growth-query';
import { useMyPointWalletQuery } from '@/features/point/hooks/use-point';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { PRIVATE } from '@/shared/constants/route';

const SUBJECT_LABEL: Record<string, string> = {
  ALGEBRA: '대수',
  CALCULUS_1: '미적분Ⅰ',
  PROBABILITY_STATISTICS: '확률과 통계',
  MATH_1: '수학Ⅰ',
  MATH_2: '수학Ⅱ',
  CALCULUS: '미적분',
};

export const StudentResultsPage = () => {
  const treeQuery = useMyTreeQuery();
  const growthQuery = useStudentGrowthQuery();
  const pointQuery = useMyPointWalletQuery();
  const tree = treeQuery.data;
  const groups = tree?.groups ?? [];
  const nodes = groups.flatMap((group) => group.nodes);
  const weakUnits = [...nodes]
    .filter((node) => node.masteryScore > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 3);
  const isEmpty =
    nodes.length === 0 || nodes.every((node) => node.masteryScore === 0);

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-white px-8 py-4">
        <h1 className="text-lg font-extrabold text-[#17191c]">내 성과</h1>
      </header>
      <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-6 py-6">
        <section
          className="rounded-xl border border-[#e3e5e8] bg-white p-5"
          data-testid="learning-map"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-extrabold">내 학습 지도</h2>
            <span className="text-xs text-[#747980]">
              {groups.length}과목 {nodes.length}단원 · 지금까지 채운 것
            </span>
            <span className="ml-auto rounded-md border border-[#dedfe2] px-2 py-1 text-[11px] font-bold">
              최근 바뀐 순
            </span>
          </div>

          {treeQuery.isError ? (
            <div className="rounded-lg border border-[#f0cbc5] bg-[#fff8f6] p-8 text-center">
              <b>학습 지도를 불러오지 못했어요</b>
              <button
                className="ml-3 rounded-md border px-3 py-1 text-xs"
                onClick={() => treeQuery.refetch()}
              >
                다시 불러오기
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-4 gap-2 rounded-lg bg-[#fafafa] p-3">
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
                  <p className="mb-2 text-xs text-[#6f747b]">
                    지도 전체가 <b>{tree?.mastery.averageScore ?? 0}%</b> 찼어요
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edeef0]">
                    <i
                      className="block h-full rounded-full bg-[#f26a2e]"
                      style={{ width: `${tree?.mastery.averageScore ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.subject}>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-sm font-extrabold">
                        {SUBJECT_LABEL[group.subject] ?? group.subject}
                      </h3>
                      <span className="text-[11px] text-[#747980]">
                        {
                          group.nodes.filter((node) => node.masteryScore >= 80)
                            .length
                        }{' '}
                        / {group.nodes.length} 정복
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                      {group.nodes.map((node) => (
                        <Link
                          key={node.nodeId}
                          href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(
                            Number(node.nodeId)
                          )}
                          className="relative min-h-20 overflow-hidden rounded-lg border border-[#dedfe2] bg-white p-2 text-left"
                        >
                          <span
                            className="absolute inset-x-0 bottom-0 bg-[#ffe1d2]"
                            style={{ height: `${node.masteryScore}%` }}
                          />
                          <span className="relative block text-xs font-extrabold">
                            {node.displayName}
                          </span>
                          <span className="relative mt-3 block text-[10px] font-bold text-[#9a441f]">
                            {node.masteryScore > 0
                              ? `${node.masteryScore}%`
                              : '미진단'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-lg bg-[#faf6f2] p-3 text-xs leading-5 text-[#5d514b]">
                칸을 누르면 그 단원 <b>단권화 노트</b>로 갑니다. 여기서는 보기만
                하고 고치지 않습니다. 숙련도 값은 <b>오픈챌린지</b>에서
                가져옵니다.
              </p>
              {isEmpty && (
                <Link
                  className="mt-3 block rounded-lg bg-[#222] px-4 py-3 text-center text-sm font-bold text-white"
                  href={PRIVATE.DASHBOARD.STUDENT}
                >
                  내 학습으로 가서 첫 문제 풀기
                </Link>
              )}
            </>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {!isEmpty && (
            <section className="rounded-xl border border-[#e3e5e8] bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-base font-extrabold">약한 단원</h2>
                <span className="text-xs text-[#747980]">
                  지도에서 가장 덜 찬 곳 셋
                </span>
              </div>
              {weakUnits.map((unit) => (
                <div
                  key={unit.nodeId}
                  className="flex min-h-14 items-center gap-3 border-t border-[#eee] py-2 first:border-t-0"
                >
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-sm">{unit.displayName}</b>
                    <small className="text-[#747980]">
                      노트 {unit.unitNotePageCount}장
                    </small>
                  </div>
                  <div className="flex w-48 items-center gap-2">
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#eee]">
                      <i
                        className="block h-full bg-[#f26a2e]"
                        style={{ width: `${unit.masteryScore}%` }}
                      />
                    </span>
                    <b className="w-9 text-xs">{unit.masteryScore}%</b>
                  </div>
                  <Link
                    className="rounded-md border px-2 py-1 text-xs font-bold"
                    href={PRIVATE.DASHBOARD.UNIT_NOTE_ROOM(Number(unit.nodeId))}
                  >
                    정리하기
                  </Link>
                </div>
              ))}
            </section>
          )}
          <section className="rounded-xl border border-[#e3e5e8] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-base font-extrabold">뱃지 · 포인트 · 레벨</h2>
              <span className="text-xs text-[#747980]">
                오픈챌린지와 같은 계정에서 쌓입니다
              </span>
            </div>
            <div className="rounded-lg bg-[#fafafa] p-4">
              <div className="flex items-end justify-between">
                <b className="text-xl">Lv.{growthQuery.data?.level ?? 0}</b>
                <span className="text-xs text-[#747980]">
                  다음 레벨까지 {growthQuery.data?.xpToNextLevel ?? 0}포인트
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee]">
                <i
                  className="block h-full bg-[#f26a2e]"
                  style={{
                    width: `${growthQuery.data ? Math.min(100, Math.round((growthQuery.data.xp / growthQuery.data.xpToNextLevel) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="my-4 flex items-center border-y border-[#eee] py-3">
              <span className="text-sm">쓸 수 있는 포인트</span>
              <b className="ml-auto text-xl text-[#9a441f]">
                {pointQuery.data?.balance ?? 0}P
              </b>
            </div>
            <div className="grid grid-cols-3 gap-2">
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
                  className="rounded-lg border border-[#e3e5e8] p-3 text-center"
                >
                  <span
                    className={`block text-lg ${earned ? 'text-[#f26a2e]' : 'text-[#a8abb0]'}`}
                  >
                    {earned ? '★' : '☆'}
                  </span>
                  <b className="text-[11px]">{label}</b>
                  {!earned && (
                    <small className="block text-[10px] text-[#747980]">
                      잠김
                    </small>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const MapStat = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <strong className="block text-xl tabular-nums">{value}</strong>
    <span className="text-[11px] text-[#747980]">{label}</span>
  </div>
);

'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  type UnitNotePage,
  repository,
} from '@/entities/unit-note';
import StudentDashboardHeader from '@/features/dashboard/components/header/student-header';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  ImageOff,
  Pin,
  RefreshCw,
  Scissors,
  Star,
  Trash2,
} from 'lucide-react';

import {
  useAppendUnitNotePages,
  useDeleteUnitNotePage,
  useUnitNoteDetailQuery,
  useUnitNoteLibraryQuery,
  useUpdateUnitNotePage,
} from '../hooks/use-unit-note-query';
import { UnitNoteEditor } from './unit-note-editor';
import { UnitNoteLeaf } from './unit-note-leaf';

type UnitNoteRoomProps = {
  rootNodeId: number;
};

type PagePreviewProps = {
  page: UnitNotePage;
  compact?: boolean;
};

const PagePreview = ({ page, compact = false }: PagePreviewProps) => {
  const [failed, setFailed] = useState(false);
  const isImage = page.mimeType?.startsWith('image/');
  if (isImage && page.viewUrl && !failed) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-lg ${compact ? 'h-20' : 'h-44'}`}
      >
        <Image
          fill
          unoptimized
          src={page.viewUrl}
          alt={`${page.fileName} 미리보기`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  const Icon = page.mimeType === 'application/pdf' ? FileText : ImageOff;
  return (
    <div
      className={`bg-gray-1 text-gray-7 flex w-full flex-col items-center justify-center rounded-lg px-3 text-center ${compact ? 'h-20' : 'h-44'}`}
    >
      <Icon size={30} />
      <span className="font-caption-heading mt-2 line-clamp-2">
        {page.fileName}
      </span>
      <span className="font-caption-normal mt-1">파일 미리보기</span>
    </div>
  );
};

export const UnitNoteRoom = ({ rootNodeId }: UnitNoteRoomProps) => {
  const libraryQuery = useUnitNoteLibraryQuery();
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const root = libraryQuery.data?.nodes.find(
    (node) => node.nodeId === rootNodeId
  );
  const concepts = useMemo(() => {
    const nodes = libraryQuery.data?.nodes ?? [];
    if (!root) return [];
    const children = nodes.filter((node) => node.parentId === root.nodeId);
    return children.length > 0 ? children : [root];
  }, [libraryQuery.data?.nodes, root]);
  const defaultConcept = useMemo(
    () =>
      [...concepts].sort((left, right) => right.pageCount - left.pageCount)[0],
    [concepts]
  );
  const activeNodeId = selectedNodeId ?? defaultConcept?.nodeId ?? 0;
  const activeConcept =
    concepts.find((node) => node.nodeId === activeNodeId) ?? defaultConcept;
  const detailQuery = useUnitNoteDetailQuery(activeNodeId);
  const updatePage = useUpdateUnitNotePage(activeNodeId);
  const deletePage = useDeleteUnitNotePage(activeNodeId);
  const appendPage = useAppendUnitNotePages(activeNodeId);
  const [snippingId, setSnippingId] = useState<number | null>(null);

  const appendTeachingSnip = async (layer: {
    teachingNoteId: number;
    title: string;
    summary: string;
  }) => {
    setSnippingId(layer.teachingNoteId);
    try {
      const file = await teachingSnipFile(layer.title, layer.summary);
      const uploaded = await repository.uploadPageFile(file);
      await appendPage.mutateAsync({
        pages: [{ source: 'UPLOAD', mediaId: uploaded.mediaId, cover: false }],
      });
    } finally {
      setSnippingId(null);
    }
  };

  if (libraryQuery.isPending) {
    return (
      <main className="mx-auto w-full max-w-[1120px] px-4 py-8">
        <Skeleton.Block className="h-32 w-full rounded-xl" />
        <Skeleton.Block className="mt-5 h-[520px] w-full rounded-xl" />
      </main>
    );
  }

  if (libraryQuery.isError || !root || !activeConcept) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="text-gray-6 mx-auto"
          />
          <h1 className="font-headline2-heading text-gray-12 mt-3">
            이 단권화 방을 열지 못했어요
          </h1>
          <Button
            asChild
            className="mt-5"
            variant="outlined"
          >
            <Link href={PRIVATE.DASHBOARD.UNIT_NOTES}>전체 트리로</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="min-h-screen bg-[#fcfbfa]">
        <StudentDashboardHeader title="단권화 노트" />
        <main className="w-full p-4">
          <Link
            href={PRIVATE.DASHBOARD.UNIT_NOTES}
            className="font-label-heading text-gray-8 hover:text-orange-9 inline-flex min-h-8 items-center gap-2"
          >
            <ArrowLeft size={18} />
            전체 단권화
          </Link>

          <section
            className="border-red-3 bg-red-1 mt-3 rounded-xl border p-5"
            role="alert"
            data-testid="unit-note-detail-error"
          >
            <h1 className="font-headline2-heading text-red-10">
              필기를 불러오지 못했어요
            </h1>
            <p className="font-body2-normal text-red-9 mt-2 leading-relaxed">
              저장된 필기는 서버에 그대로 있습니다. 지금 화면에만 안 뜬
              상태라 새로 쓰면 덮어쓸 위험이 있어 펜을 잠갔습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="small"
                variant="outlined"
                onClick={() => void detailQuery.refetch()}
              >
                다시 불러오기
              </Button>
              <Button
                asChild
                size="small"
                variant="outlined"
              >
                <Link href={PRIVATE.TREE.INDEX}>이 단원 문제부터 풀기</Link>
              </Button>
            </div>
          </section>

          <section className="border-gray-3 bg-gray-white mt-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-gray-12 text-base font-extrabold">내 정리</h2>
              <span className="text-gray-8 text-xs">입력 잠김</span>
            </div>
            <div
              className="border-gray-3 bg-gray-1 text-gray-7 mt-3 flex min-h-48 items-center justify-center rounded-lg border border-dashed px-4 text-center text-xs font-bold"
              data-testid="unit-note-editor-locked"
            >
              필기를 불러온 뒤에 쓸 수 있어요. 다시 불러오기를 누르면
              입력할 수 있습니다.
            </div>
          </section>

          <section className="border-orange-3 bg-orange-1 mt-3 rounded-xl border p-4">
            <p className="text-gray-12 text-sm font-extrabold">
              이 단원 숙련도, 이 값은 정상입니다
            </p>
            <p className="text-gray-12 mt-2 text-2xl font-extrabold tabular-nums">
              {root.masteryScore}%
            </p>
          </section>
        </main>
      </div>
    );
  }

  const detail = detailQuery.data?.detail;
  const visiblePages =
    detail?.pages.filter((page) => !page.hiddenByStudent) ?? [];
  const hiddenTeacherPages =
    detail?.pages.filter(
      (page) => page.source === 'TEACHER' && page.hiddenByStudent
    ) ?? [];
  const branchPages = concepts.reduce(
    (total, concept) => total + concept.pageCount,
    0
  );
  const branchProblems = concepts.reduce(
    (total, concept) => total + concept.relatedProblemCount,
    0
  );

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <StudentDashboardHeader title="단권화 노트" />
      <main className="w-full p-4">
        <Link
          href={PRIVATE.DASHBOARD.UNIT_NOTES}
          className="font-label-heading text-gray-8 hover:text-orange-9 inline-flex min-h-8 items-center gap-2"
        >
          <ArrowLeft size={18} />
          전체 단권화
        </Link>

        <header className="border-gray-3 bg-gray-white mt-2 rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
              <p className="font-caption-heading text-gray-8">
                {(
                  {
                    MATH_1: '대수',
                    ALGEBRA: '대수',
                    MATH_2: '미적분Ⅰ',
                    CALCULUS_1: '미적분Ⅰ',
                    CALCULUS: '미적분Ⅱ',
                    CALCULUS_2: '미적분Ⅱ',
                    PROBABILITY_STATISTICS: '확률과 통계',
                    COMMON_MATH_1: '공통수학1',
                    COMMON_MATH_2: '공통수학2',
                    MIDDLE_MATH: '중학 수학',
                    GEOMETRY: '기하',
                  } as Record<string, string>
                )[root.subject] ?? root.subject}{' '}
                · 단권화 노트
              </p>
              <h1 className="text-gray-12 mt-1 text-lg font-extrabold">
                {root.displayName}
              </h1>
              <p className="text-gray-8 mt-1 text-xs">
                선생님 판서 · 내 필기 · 올린 파일을 한 단원에 모읍니다
              </p>
            </div>
            <div className="border-orange-3 bg-orange-1 min-w-[250px] rounded-lg border px-4 py-3">
              <p className="text-gray-12 text-sm font-extrabold">
                이 단원 숙련도 · {root.masteryScore}%
              </p>
              <div className="bg-gray-2 mt-2 h-2 overflow-hidden rounded-full">
                <i
                  className="bg-orange-7 block h-full"
                  style={{ width: `${root.masteryScore}%` }}
                />
              </div>
              <p className="text-gray-8 mt-2 text-[11px]">
                문제 {branchProblems}개 · 노트 {branchPages}장
              </p>
            </div>
          </div>
        </header>

        <section className="border-gray-3 bg-gray-white mt-3 rounded-xl border p-4">
          <h2 className="text-gray-12 text-base font-extrabold">단원 목록</h2>
          <p className="font-caption-normal text-gray-8 mt-1">
            접힌 단원 행을 누르면 그 단원의 노트가 아래에 뜹니다.
          </p>
          <div className="mt-4 flex flex-col">
            {concepts.map((concept) => (
              <button
                key={concept.nodeId}
                type="button"
                className={`border-gray-2 grid h-[46px] cursor-pointer grid-cols-[28px_minmax(0,1fr)_72px_44px] items-center gap-2 border-b text-left last:border-b-0 ${
                  activeNodeId === concept.nodeId ? 'bg-orange-1' : ''
                }`}
                onClick={() => setSelectedNodeId(concept.nodeId)}
                data-testid={`unit-note-concept-row-${concept.nodeId}`}
              >
                <UnitNoteLeaf
                  level={concept.leafLevel}
                  className="size-5"
                />
                <span className="min-w-0">
                  <span className="font-body2-heading text-gray-12 block truncate">
                    {concept.displayName}
                  </span>
                  <span className="font-caption-normal text-gray-7 block truncate">
                    펜 {concept.penPageCount} · 업로드 {concept.uploadPageCount}{' '}
                    · 선생님 {concept.teachingNoteCount}
                  </span>
                </span>
                <span className="font-label-heading text-orange-9 text-right">
                  {concept.pageCount === 0 ? '페이지 만들기' : '열기'}
                </span>
                <span className="font-caption-heading border-gray-3 bg-gray-white text-gray-8 flex h-8 w-11 items-center justify-center rounded-full border text-center">
                  {concept.pageCount}장
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="border-gray-3 bg-gray-white mt-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-gray-12 text-base font-extrabold">
              {activeConcept.displayName} · 내 정리
            </h2>
            <span className="text-gray-8 text-xs">
              내 필기 {activeConcept.penPageCount}장 · 올린 파일{' '}
              {activeConcept.uploadPageCount}장 · 선생님 판서{' '}
              {activeConcept.teachingNoteCount}장
            </span>
          </div>
          {detailQuery.isPending ? (
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              <Skeleton.Block className="h-28 w-full" />
              <Skeleton.Block className="h-28 w-full" />
            </div>
          ) : visiblePages.length === 0 ? (
            <div className="border-gray-3 text-gray-8 mt-3 flex min-h-24 items-center justify-center rounded-lg border border-dashed text-xs font-bold">
              아직 이 단원에 노트가 없어요. 아래에서 첫 장을 만드세요.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {visiblePages.slice(0, 4).map((page) => (
                <article
                  key={page.pageId}
                  className={`rounded-lg border p-2 ${page.source === 'TEACHER' ? 'border-orange-7 bg-orange-1' : 'border-gray-3'}`}
                >
                  <PagePreview
                    page={page}
                    compact
                  />
                  <p className="text-gray-11 mt-2 truncate text-[11px] font-bold">
                    {page.fileName}
                  </p>
                  <p className="text-gray-7 mt-0.5 text-[10px]">
                    {page.position}장 ·{' '}
                    {page.source === 'PEN'
                      ? '내 필기'
                      : page.source === 'TEACHER'
                        ? '선생님 판서'
                        : '올린 파일'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
          <UnitNoteEditor
            key={activeConcept.nodeId}
            nodeId={activeConcept.nodeId}
            displayName={activeConcept.displayName}
            nextPageNumber={activeConcept.pageCount + 1}
          />

          <aside className="flex flex-col gap-5">
            <section className="border-gray-3 bg-gray-white rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <Pin
                  size={20}
                  className="text-orange-7"
                />
                <h2 className="font-body1-heading text-gray-12">선생님 판서</h2>
                <span className="font-caption-heading bg-orange-1 text-orange-10 ml-auto rounded-full px-2.5 py-1">
                  {detail?.teachingLayers.length ?? 0}층
                </span>
              </div>
              {detailQuery.isPending ? (
                <Skeleton.Block className="mt-3 h-24 w-full" />
              ) : (detail?.teachingLayers.length ?? 0) === 0 ? (
                <p className="font-caption-normal text-gray-7 mt-3">
                  이 소단원에 연결된 판서가 아직 없어요.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {detail?.teachingLayers.map((layer) => (
                    <details
                      key={layer.teachingNoteId}
                      className="border-gray-3 rounded-lg border p-3"
                    >
                      <summary className="font-label-heading text-gray-11 cursor-pointer">
                        {layer.title}
                      </summary>
                      <p className="font-caption-normal text-gray-8 mt-2 leading-relaxed">
                        {layer.summary}
                      </p>
                      <button
                        type="button"
                        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#e1aa8d] px-3 text-xs font-bold text-[#9a441f] disabled:opacity-50"
                        disabled={snippingId !== null}
                        onClick={() => void appendTeachingSnip(layer)}
                      >
                        <Scissors size={16} />
                        {snippingId === layer.teachingNoteId
                          ? '조각 붙이는 중'
                          : '판서 조각을 내 노트에 붙이기'}
                      </button>
                    </details>
                  ))}
                </div>
              )}
            </section>

            <section className="border-gray-3 bg-gray-white rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <GraduationCap
                  size={20}
                  className="text-orange-7"
                />
                <h2 className="font-body1-heading text-gray-12">관련 문제</h2>
              </div>
              {(detail?.relatedProblems.length ?? 0) === 0 ? (
                <p className="font-caption-normal text-gray-7 mt-3">
                  이 소단원과 연결된 오답이 아직 없어요.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {detail?.relatedProblems.map((problem) => (
                    <Link
                      key={problem.wrongAnswerId}
                      href={PRIVATE.DASHBOARD.WRONG_ANSWER_REVIEW(
                        problem.wrongAnswerId
                      )}
                      className="border-gray-3 hover:border-orange-5 rounded-lg border p-3"
                    >
                      <p className="font-label-heading text-gray-11">
                        {problem.title}
                      </p>
                      <p className="font-caption-normal text-gray-7 mt-1 line-clamp-2">
                        {problem.sourceText} · {problem.reviewCount}회독째
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>

        <section className="border-gray-3 bg-gray-white mt-5 rounded-xl border p-4 md:p-6">
          <h2 className="font-headline2-heading text-gray-12">
            {activeConcept.displayName} · 내 페이지
          </h2>
          <p className="font-caption-normal text-gray-8 mt-1">
            지우고 덮어쓰지 않고, 만든 순서대로 지층이 쌓여요.
          </p>
          {detailQuery.isPending ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton.Block className="h-64 w-full" />
              <Skeleton.Block className="h-64 w-full" />
            </div>
          ) : visiblePages.length === 0 && hiddenTeacherPages.length === 0 ? (
            <div className="border-gray-3 mt-4 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <BookOpen
                size={34}
                className="text-gray-5"
              />
              <p className="font-body1-heading text-gray-11 mt-3">
                아직 내 페이지가 없어요
              </p>
              <p className="font-caption-normal text-gray-7 mt-1">
                위에서 펜으로 쓰거나 굿노트 PDF를 올려 첫 장을 만드세요.
              </p>
            </div>
          ) : (
            <div
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="unit-note-page-grid"
            >
              {visiblePages.map((page, index, pages) => (
                <article
                  key={page.pageId}
                  className={`rounded-xl border p-3 ${page.source === 'TEACHER' ? 'border-[#f26a2e] bg-[#fffaf7]' : 'border-gray-3'}`}
                  data-testid={`unit-note-page-${page.pageId}`}
                >
                  <PagePreview page={page} />
                  <div className="mt-3 flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-label-heading text-gray-11 truncate">
                        {page.fileName}
                      </p>
                      <p className="font-caption-normal text-gray-7 mt-1">
                        {page.position}페이지 ·{' '}
                        {page.source === 'PEN'
                          ? '펜'
                          : page.source === 'TEACHER'
                            ? '선생님'
                            : '업로드'}
                      </p>
                    </div>
                    {page.cover && (
                      <span className="font-caption-heading bg-orange-1 text-orange-10 rounded-full px-2 py-1">
                        표지
                      </span>
                    )}
                  </div>
                  {page.source === 'TEACHER' ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#ffe6d7] px-2 py-1 text-[10px] font-bold text-[#9a441f]">
                        선생님
                      </span>
                      <button
                        type="button"
                        className="ml-auto flex min-h-11 items-center gap-1 rounded-lg border px-3 text-xs font-bold"
                        onClick={() =>
                          updatePage.mutate({
                            pageId: page.pageId,
                            input: { hidden: !page.hiddenByStudent },
                          })
                        }
                      >
                        <EyeOff size={16} />
                        숨기기
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1">
                      <PageAction
                        label="위로"
                        disabled={index === 0}
                        onClick={() =>
                          updatePage.mutate({
                            pageId: page.pageId,
                            input: { position: page.position - 1 },
                          })
                        }
                      >
                        <ArrowUp size={17} />
                      </PageAction>
                      <PageAction
                        label="아래로"
                        disabled={index === pages.length - 1}
                        onClick={() =>
                          updatePage.mutate({
                            pageId: page.pageId,
                            input: { position: page.position + 1 },
                          })
                        }
                      >
                        <ArrowDown size={17} />
                      </PageAction>
                      <PageAction
                        label="표지로"
                        disabled={page.cover}
                        onClick={() =>
                          updatePage.mutate({
                            pageId: page.pageId,
                            input: { cover: true },
                          })
                        }
                      >
                        <Star size={17} />
                      </PageAction>
                      <PageAction
                        label="삭제"
                        onClick={() => deletePage.mutate(page.pageId)}
                      >
                        <Trash2 size={17} />
                      </PageAction>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          {hiddenTeacherPages.length > 0 && (
            <details
              className="border-gray-3 bg-gray-1 mt-4 rounded-xl border p-3"
              data-testid="hidden-teacher-pages"
            >
              <summary className="font-label-heading text-gray-10 cursor-pointer">
                숨긴 선생님 노트 {hiddenTeacherPages.length}장이 있어요 · 숨긴
                것 보기
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {hiddenTeacherPages.map((page) => (
                  <article
                    key={page.pageId}
                    className="rounded-xl border border-[#f26a2e] bg-[#fffaf7] p-3 opacity-60"
                    data-testid={`unit-note-page-${page.pageId}`}
                  >
                    <PagePreview page={page} />
                    <div className="mt-3 flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-label-heading text-gray-11 truncate">
                          {page.fileName}
                        </p>
                        <p className="font-caption-normal text-gray-7 mt-1">
                          {page.position}페이지 · 선생님 · 학생이 숨김
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-[#ffe6d7] px-2 py-1 text-[10px] font-bold text-[#9a441f]">
                        선생님
                      </span>
                      <button
                        type="button"
                        className="ml-auto flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border px-3 text-xs font-bold"
                        onClick={() =>
                          updatePage.mutate({
                            pageId: page.pageId,
                            input: { hidden: false },
                          })
                        }
                      >
                        <Eye size={16} />
                        다시 꺼내기
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          )}
        </section>
      </main>
    </div>
  );
};

const PageAction = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    className="text-gray-7 hover:bg-gray-1 flex size-11 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-30"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const teachingSnipFile = async (
  title: string,
  summary: string
): Promise<File> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('판서 조각을 만들 수 없어요.');
  context.fillStyle = '#fffdf9';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#f26a2e';
  context.lineWidth = 12;
  context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  context.fillStyle = '#1f2328';
  context.font = '700 52px sans-serif';
  context.fillText(title, 80, 120);
  context.font = '36px sans-serif';
  Array.from({ length: Math.ceil(summary.length / 26) }, (_, index) =>
    summary.slice(index * 26, (index + 1) * 26)
  ).forEach((line, index) => context.fillText(line, 80, 220 + index * 58));
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error('판서 조각 저장에 실패했어요.')),
      'image/png'
    )
  );
  return new File([blob], `${title}-판서-조각.png`, { type: 'image/png' });
};

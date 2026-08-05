'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import type { UnitNoteNode, UnitNotePage } from '@/entities/unit-note';
import { Skeleton } from '@/shared/components/loading';
import { Button } from '@/shared/components/ui';
import { PRIVATE } from '@/shared/constants/route';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  FileImage,
  FileText,
  GraduationCap,
  Eye,
  EyeOff,
  ImageOff,
  PenLine,
  Pin,
  RefreshCw,
  Star,
  Trash2,
} from 'lucide-react';

import {
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
};

const PagePreview = ({ page }: PagePreviewProps) => {
  const [failed, setFailed] = useState(false);
  const isImage = page.mimeType?.startsWith('image/');
  if (isImage && page.viewUrl && !failed) {
    return (
      <div className="relative h-44 w-full overflow-hidden rounded-lg">
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
    <div className="bg-gray-1 text-gray-7 flex h-44 w-full flex-col items-center justify-center rounded-lg px-3 text-center">
      <Icon size={30} />
      <span className="font-caption-heading mt-2 line-clamp-2">
        {page.fileName}
      </span>
      <span className="font-caption-normal mt-1">파일 미리보기</span>
    </div>
  );
};

const ConceptCover = ({ concept }: { concept: UnitNoteNode }) => {
  const [failed, setFailed] = useState(false);
  const cover = concept.coverPage;
  const canPreview =
    cover?.mimeType?.startsWith('image/') && cover.viewUrl && !failed;

  if (canPreview) {
    return (
      <Image
        fill
        unoptimized
        src={cover!.viewUrl!}
        alt={`${concept.displayName} 표지`}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  const Icon =
    cover?.mimeType === 'application/pdf'
      ? FileText
      : cover?.source === 'PEN'
        ? PenLine
        : cover
          ? FileImage
          : BookOpen;
  return (
    <div className="bg-gray-1 text-gray-6 flex size-full flex-col items-center justify-center">
      <Icon size={28} />
      <span className="font-caption-normal mt-2 line-clamp-1 max-w-full px-2">
        {cover?.fileName ?? '첫 페이지를 만들어 보세요'}
      </span>
    </div>
  );
};

const aggregateLevel = (
  root: UnitNoteNode,
  concepts: UnitNoteNode[]
): UnitNoteNode['leafLevel'] => {
  const nodes = [root, ...concepts];
  if (nodes.some((node) => node.leafLevel === 'DEEP')) return 'DEEP';
  if (nodes.some((node) => node.leafLevel === 'LIT')) return 'LIT';
  return 'GRAY';
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

  const detail = detailQuery.data?.detail;
  const branchPages = concepts.reduce(
    (total, concept) => total + concept.pageCount,
    0
  );
  const branchPenPages = concepts.reduce(
    (total, concept) => total + concept.penPageCount,
    0
  );
  const branchUploadPages = concepts.reduce(
    (total, concept) => total + concept.uploadPageCount,
    0
  );
  const branchProblems = concepts.reduce(
    (total, concept) => total + concept.relatedProblemCount,
    0
  );

  return (
    <main className="bg-system-background min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <Link
          href={PRIVATE.DASHBOARD.UNIT_NOTES}
          className="font-label-heading text-gray-8 hover:text-orange-9 inline-flex min-h-11 items-center gap-2"
        >
          <ArrowLeft size={18} />
          전체 단권화
        </Link>

        <header className="border-gray-3 bg-gray-white mt-2 rounded-xl border p-5 md:p-7">
          <div className="flex items-start gap-4">
            <UnitNoteLeaf
              level={aggregateLevel(root, concepts)}
              className="mt-1 size-12"
            />
            <div>
              <p className="font-caption-heading text-gray-7">
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
                · 내가 만드는 책
              </p>
              <h1 className="font-title-heading text-gray-12 mt-1">
                나의 {root.displayName} 단권화
              </h1>
              <p className="font-body2-normal text-gray-8 mt-2">
                선생님 판서 + 내 노트 + 관련 문제가 소단원별 지층으로 계속
                쌓여요.
              </p>
            </div>
          </div>
          <div className="border-orange-3 bg-orange-1 mt-5 rounded-lg border px-4 py-3">
            <p className="font-body1-heading text-gray-12">
              이 책, 지금 {branchPages}페이지
            </p>
            <p className="font-caption-normal text-gray-8 mt-1">
              펜 {branchPenPages}장 · 굿노트/PDF {branchUploadPages}장 · 소단원{' '}
              {concepts.length}개 · 관련 문제 {branchProblems}개
            </p>
          </div>
        </header>

        <section className="border-gray-3 bg-gray-white mt-5 rounded-xl border p-4 md:p-6">
          <div className="flex items-center gap-2">
            <BookOpen
              size={22}
              className="text-orange-7"
            />
            <div>
              <h2 className="font-headline2-heading text-gray-12">내 책장</h2>
              <p className="font-caption-normal text-gray-8">
                낱장이 서가에 꽂히듯 소단원 두께를 한눈에 봐요.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {concepts.map((concept) => (
              <button
                key={concept.nodeId}
                type="button"
                className={`min-h-40 cursor-pointer rounded-xl border p-3 text-left ${
                  activeNodeId === concept.nodeId
                    ? 'border-orange-7 bg-orange-1'
                    : 'border-gray-3 hover:bg-gray-1'
                }`}
                onClick={() => setSelectedNodeId(concept.nodeId)}
                data-testid={`unit-note-concept-card-${concept.nodeId}`}
              >
                <div className="bg-gray-white border-gray-2 relative h-20 overflow-hidden rounded-lg border">
                  <ConceptCover concept={concept} />
                </div>
                <p className="font-label-heading text-gray-12 mt-3 truncate">
                  {concept.displayName}
                </p>
                <p className="font-caption-normal text-gray-7 mt-1">
                  {concept.pageCount}장
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="border-gray-3 bg-gray-white mt-5 rounded-xl border p-4 md:p-6">
          <h2 className="font-headline2-heading text-gray-12">소단원 목차</h2>
          <p className="font-caption-normal text-gray-8 mt-1">
            날짜가 아니라 교과 개념으로 찾고, 날짜는 각 블록 안에 남겨요.
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
                  <span className="font-caption-normal text-gray-7 block truncate">펜 {concept.penPageCount} · 업로드 {concept.uploadPageCount} · 선생님 {concept.teachingNoteCount}</span>
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

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
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
          ) : (detail?.pages.length ?? 0) === 0 ? (
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
              {detail?.pages.map((page, index, pages) => (
                <article
                  key={page.pageId}
                  className={`rounded-xl border p-3 ${page.source === 'TEACHER' ? 'border-[#f26a2e] bg-[#fffaf7]' : 'border-gray-3'} ${page.hiddenByStudent ? 'opacity-60' : ''}`}
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
                        {page.source === 'PEN' ? '펜' : page.source === 'TEACHER' ? '선생님' : '업로드'}
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
                      <span className="rounded-full bg-[#ffe6d7] px-2 py-1 text-[10px] font-bold text-[#9a441f]">선생님</span>
                      <button type="button" className="ml-auto flex min-h-11 items-center gap-1 rounded-lg border px-3 text-xs font-bold" onClick={() => updatePage.mutate({ pageId: page.pageId, input: { hidden: !page.hiddenByStudent } })}>
                        {page.hiddenByStudent ? <Eye size={16} /> : <EyeOff size={16} />}{page.hiddenByStudent ? '다시 꺼내기' : '숨기기'}
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
        </section>
      </div>
    </main>
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

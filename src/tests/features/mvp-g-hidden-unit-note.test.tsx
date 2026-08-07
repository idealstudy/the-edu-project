import { UnitNoteRoom } from '@/features/unit-note/components/unit-note-room';
import { renderWithProviders } from '@/tests/utils';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock('@/features/unit-note/hooks/use-unit-note-query', () => ({
  useUnitNoteLibraryQuery: () => ({
    data: {
      nodes: [
        {
          nodeId: 10,
          parentId: null,
          subject: 'ALGEBRA',
          unit: '다항식',
          displayName: '다항식',
          depth: 1,
          pageCount: 1,
          penPageCount: 0,
          uploadPageCount: 0,
          teachingNoteCount: 1,
          relatedProblemCount: 0,
          masteryScore: 0,
          hintFreeSolveCount: 0,
          leafLevel: 'GRAY',
          coverPage: null,
        },
      ],
    },
    isPending: false,
    isError: false,
  }),
  useUnitNoteDetailQuery: () => ({
    data: {
      detail: {
        nodeId: 10,
        pages: [
          {
            pageId: 77,
            position: 1,
            source: 'TEACHER',
            fileName: '선생님 판서.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 100,
            viewUrl: null,
            cover: false,
            hiddenByStudent: true,
            teacherId: 2,
            teacherMemo: null,
            createdAt: null,
          },
        ],
        teachingLayers: [],
        relatedProblems: [],
      },
    },
    isPending: false,
  }),
  useUpdateUnitNotePage: () => ({ mutate: mocks.update }),
  useDeleteUnitNotePage: () => ({ mutate: vi.fn() }),
  useAppendUnitNotePages: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/features/unit-note/components/unit-note-editor', () => ({
  UnitNoteEditor: () => <div>편집기</div>,
}));

vi.mock('@/features/unit-note/components/unit-note-leaf', () => ({
  UnitNoteLeaf: () => <span>잎</span>,
}));

describe('MVP-G 숨긴 선생님 단권화 페이지', () => {
  test('편집 행동을 누르면 단원 목록 대신 편집 도구가 첫 작업 영역에 온다', () => {
    renderWithProviders(<UnitNoteRoom rootNodeId={10} />);

    fireEvent.click(screen.getByTestId('unit-note-open-pen'));

    const firstView = screen.getByTestId('unit-note-editor-first-view');
    expect(firstView).toHaveTextContent('편집기');
    expect(firstView).toHaveTextContent('선생님 판서');
    expect(screen.queryByText('단원 목록')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '단원 목록으로' })).toBeEnabled();
  });

  test('기본 접힘으로 표시하고 다시 꺼내기를 요청한다', () => {
    renderWithProviders(<UnitNoteRoom rootNodeId={10} />);

    const hiddenGroup = screen.getByTestId('hidden-teacher-pages');
    expect(hiddenGroup).not.toHaveAttribute('open');
    expect(screen.getByText(/숨긴 선생님 노트 1장/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/숨긴 선생님 노트 1장/));
    fireEvent.click(screen.getByRole('button', { name: '다시 꺼내기' }));

    expect(mocks.update).toHaveBeenCalledWith({
      pageId: 77,
      input: { hidden: false },
    });
  });
});

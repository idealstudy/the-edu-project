import { LookBackPage } from '@/features/dashboard/components/student/look-back-page';
import { WrongAnswerWarehouse } from '@/features/dashboard/components/student/wrong-answer-warehouse';
import { UnitNoteLibrary } from '@/features/unit-note/components/unit-note-library';
import { UnitNoteRoom } from '@/features/unit-note/components/unit-note-room';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  library: vi.fn(),
  lookBack: vi.fn(),
  weeklyRetro: vi.fn(),
  wrongAnswers: vi.fn(),
}));

vi.mock('@/features/dashboard/hooks/use-look-back-query', () => ({
  useLookBackQuery: mocks.lookBack,
}));

vi.mock('@/features/dashboard/hooks/use-retrospect-query', () => ({
  useWeeklyRetrospectQuery: mocks.weeklyRetro,
}));

vi.mock('@/features/dashboard/hooks/use-wrong-answer-query', () => ({
  useWrongAnswersQuery: mocks.wrongAnswers,
}));

vi.mock('@/features/unit-note/hooks/use-unit-note-query', () => ({
  useAppendUnitNotePages: () => ({ mutateAsync: vi.fn() }),
  useDeleteUnitNotePage: () => ({ mutate: vi.fn() }),
  useUnitNoteDetailQuery: mocks.detail,
  useUnitNoteLibraryQuery: mocks.library,
  useUpdateUnitNotePage: () => ({ mutate: vi.fn() }),
}));

describe('MVP-G v22 상태 계약', () => {
  beforeEach(() => {
    mocks.lookBack.mockReturnValue({
      data: { calendar: [], coachMessage: null, retrospects: [] },
      isError: false,
    });
    mocks.wrongAnswers.mockReturnValue({
      data: { items: [], totalCount: 0 },
      isError: false,
      isPending: false,
      isSuccess: true,
    });
    mocks.library.mockReturnValue({
      data: {
        nodes: [
          {
            nodeId: 10,
            parentId: null,
            subject: 'MATH_1',
            unit: 'sequence',
            displayName: '수열',
            depth: 0,
            pageCount: 1,
            penPageCount: 1,
            uploadPageCount: 0,
            teachingNoteCount: 0,
            relatedProblemCount: 0,
            masteryScore: 42,
            hintFreeSolveCount: 0,
            leafLevel: 'LIT',
            coverPage: null,
          },
          {
            nodeId: 14,
            parentId: 10,
            subject: 'MATH_1',
            unit: 'induction',
            displayName: '수학적 귀납법',
            depth: 1,
            pageCount: 1,
            penPageCount: 1,
            uploadPageCount: 0,
            teachingNoteCount: 0,
            relatedProblemCount: 0,
            masteryScore: 42,
            hintFreeSolveCount: 0,
            leafLevel: 'LIT',
            coverPage: null,
          },
        ],
      },
      isError: false,
      isPending: false,
    });
    mocks.detail.mockReturnValue({
      isError: true,
      refetch: vi.fn(),
    });
    mocks.weeklyRetro.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: false,
    });
  });

  it('돌아보기 빈 상태에서 오늘 할 일로 돌아간다', () => {
    render(<LookBackPage />);

    const action = screen.getByRole('link', {
      name: '오늘 할 일 적으러 가기',
    });
    expect(action).toHaveAttribute('href', '/dashboard/student');
  });

  it('돌아보기 주간 패널에 v22 통계 3칸 구조를 유지한다', () => {
    render(<LookBackPage />);

    expect(screen.getByTestId('look-back-weekly-stats')).toBeVisible();
    expect(screen.getByText('푼 문제')).toBeVisible();
    expect(screen.getByText('해설 없이 맞힘')).toBeVisible();
    expect(screen.getByText('정리한 단원')).toBeVisible();
    expect(screen.getAllByText('집계 전')).toHaveLength(3);
  });

  it('오답 빈 상태에서 오늘의 문제로 돌아간다', () => {
    render(<WrongAnswerWarehouse />);

    const action = screen.getByRole('link', {
      name: '오늘의 문제 풀러 가기',
    });
    expect(action).toHaveAttribute('href', '/dashboard/student');
  });

  it('단권화 상세 로드 실패 시 입력을 잠그고 복구 행동을 보인다', () => {
    render(<UnitNoteRoom rootNodeId={10} />);

    expect(screen.getByTestId('unit-note-detail-error')).toBeVisible();
    expect(screen.getByTestId('unit-note-editor-locked')).toBeVisible();
    expect(screen.queryByTestId('unit-note-editor')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 불러오기' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: '이 단원 문제부터 풀기' })
    ).toHaveAttribute('href', '/tree');
  });

  it('단권화 인덱스에 과목표와 최근 정리, 단원 이어쓰기를 함께 둔다', () => {
    render(<UnitNoteLibrary />);

    expect(screen.getByRole('heading', { name: '과목' })).toBeVisible();
    expect(screen.getByTestId('unit-note-recent-section')).toBeVisible();
    expect(screen.getByText('최근에 쓴 정리')).toBeVisible();
    expect(screen.getByRole('link', { name: '이어 쓰기' })).toHaveAttribute(
      'href',
      '/dashboard/student/unit-notes/14'
    );
  });
});

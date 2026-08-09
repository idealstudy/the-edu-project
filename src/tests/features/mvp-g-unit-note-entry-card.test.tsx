import { UnitNoteEntryCard } from '@/features/unit-note/components/unit-note-entry-card';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ library: vi.fn() }));

vi.mock('@/features/unit-note/hooks/use-unit-note-query', () => ({
  useUnitNoteLibraryQuery: mocks.library,
}));

const node = (subject: string, unitId: number, pageCount: number) => ({
  subject,
  unitId,
  unitName: `${subject} ${unitId}단원`,
  masteryScore: 0,
  pageCount,
});

afterEach(cleanup);

/*
 * fix-report-v8-2 곁다리 관찰: 정리 진행률 0% 인데 "마지막 정리 기록 있음" 이 떴다.
 * 원인은 문구가 단원 트리 보유 여부로만 갈렸던 것. 판정 기준을 실제 노트 쪽수로 옮겼다.
 */
describe('단권화 카드 과목 보조문구', () => {
  test('단원 트리는 있어도 정리한 노트가 없으면 정리 기록이 있다고 말하지 않는다', () => {
    mocks.library.mockReturnValue({
      data: {
        nodes: [node('ALGEBRA', 1, 0), node('ALGEBRA', 2, 0)],
      },
      isError: false,
    });

    renderWithProviders(<UnitNoteEntryCard />);

    expect(screen.getByText('2단원 · 아직 정리한 노트 없음')).toBeVisible();
    expect(screen.queryByText(/마지막 정리 기록 있음/)).toBeNull();
    // 진행률 0% 와 문구가 서로 어긋나지 않아야 한다.
    expect(
      screen.getByLabelText('대수 문제 0퍼센트, 정리 0퍼센트')
    ).toBeVisible();
  });

  test('정리한 노트가 있으면 그 쪽수를 그대로 보여준다', () => {
    mocks.library.mockReturnValue({
      data: { nodes: [node('ALGEBRA', 1, 3)] },
      isError: false,
    });

    renderWithProviders(<UnitNoteEntryCard />);

    expect(screen.getByText('1단원 · 정리한 노트 3쪽')).toBeVisible();
  });

  test('단원 트리 자체가 없으면 아직 시작 전이다', () => {
    mocks.library.mockReturnValue({ data: { nodes: [] }, isError: false });

    renderWithProviders(<UnitNoteEntryCard />);

    expect(screen.getAllByText('아직 시작 전')).toHaveLength(3);
  });
});

import {
  CollectionLayout,
  ExamTakeLayout,
  ExamWizardLayout,
  PageLayout,
  SplitLayout,
} from '@/layout';
import { EmptyState } from '@/shared/components/ui';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';

describe('디자인 시스템 레이아웃', () => {
  afterEach(() => cleanup());

  test('PageLayout은 전역 최대 폭과 페이지 여백 토큰을 소유한다', () => {
    render(<PageLayout data-testid="page">본문</PageLayout>);

    expect(screen.getByTestId('page')).toHaveClass(
      'max-w-page',
      'px-section-gap',
      'py-section-gap'
    );
  });

  test('SplitLayout은 v22 1.28 대 1 비율 클래스를 사용한다', () => {
    render(<SplitLayout data-testid="split">본문</SplitLayout>);

    expect(screen.getByTestId('split')).toHaveClass('lg:grid-split-v22');
  });

  test('CollectionLayout은 0건과 과다 항목을 같은 계약으로 처리한다', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CollectionLayout emptyState={<EmptyState title="기록이 없어요" />}>
        {[]}
      </CollectionLayout>
    );

    expect(screen.getByText('기록이 없어요')).toBeInTheDocument();

    rerender(
      <CollectionLayout
        emptyState={<EmptyState title="기록이 없어요" />}
        maxVisibleItems={1}
      >
        <div>첫 기록</div>
        <div>둘째 기록</div>
      </CollectionLayout>
    );

    expect(screen.queryByText('둘째 기록')).toBeNull();
    await user.click(screen.getByRole('button', { name: '더 보기 (1)' }));
    expect(screen.getByText('둘째 기록')).toBeInTheDocument();
  });

  test('응시장 레이아웃은 v22 레일과 마법사 열을 소유한다', () => {
    render(
      <>
        <ExamTakeLayout data-testid="exam-take" />
        <ExamTakeLayout
          folded
          data-testid="exam-take-folded"
        />
        <ExamWizardLayout data-testid="exam-wizard" />
      </>
    );

    expect(screen.getByTestId('exam-take')).toHaveClass('md:grid-exam-take');
    expect(screen.getByTestId('exam-take-folded')).toHaveClass(
      'grid-exam-take-folded'
    );
    expect(screen.getByTestId('exam-wizard')).toHaveClass(
      'lg:grid-exam-wizard'
    );
  });
});

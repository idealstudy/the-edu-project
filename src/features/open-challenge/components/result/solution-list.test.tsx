import { renderWithProviders } from '@/tests/utils';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { SolutionList } from './solution-list';

describe('SolutionList 풀이 공개와 내리기', () => {
  test('틀린 풀이에도 작성자 이름을 표시하고 본인만 내리기 확인을 거친다', () => {
    const onWithdraw = vi.fn();

    renderWithProviders(
      <SolutionList
        solutions={[
          {
            id: 'review-1',
            nickname: '도윤',
            authorNickname: '도윤',
            subject: '수학',
            content: '',
            solutionType: 'DRAWING',
            drawingImageUrl: null,
            recommendCount: 0,
            isBest: false,
            isRecommendedByMe: false,
            isCorrect: false,
            isMine: true,
          },
        ]}
        totalCount={1}
        sort="recommend"
        onSortChange={vi.fn()}
        onRecommendToggle={vi.fn()}
        onWithdraw={onWithdraw}
      />
    );

    expect(screen.getByText('도윤')).toBeInTheDocument();
    expect(screen.getByText('틀린 풀이')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '내 풀이 메뉴' }));
    expect(screen.getByText('이 풀이를 내릴까요?')).toBeInTheDocument();
    expect(
      screen.getByText(/정오 기록, 걸린 시간, 정복 지도 점수는 그대로/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '내리기' }));

    expect(onWithdraw).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'review-1', isMine: true })
    );
  });
});

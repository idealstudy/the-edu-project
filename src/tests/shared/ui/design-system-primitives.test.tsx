import {
  Button,
  Card,
  DataList,
  EmptyState,
  MediaFrame,
  StatChip,
} from '@/shared/components/ui';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

describe('디자인 시스템 공용 부품', () => {
  afterEach(() => cleanup());

  test('Button 로딩 상태는 중복 클릭을 막고 상태 문구를 노출한다', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button
        isLoading
        loadingText="저장 중"
        onClick={onClick}
      >
        저장
      </Button>
    );

    const button = screen.getByRole('button', { name: '저장 중' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('Card와 StatChip은 텍스트·숫자 넘침 방어 계약을 가진다', () => {
    render(
      <Card>
        <Card.Header>
          <div>
            <Card.Title>아주 긴 카드 제목</Card.Title>
            <Card.Description>아주 긴 카드 설명</Card.Description>
          </div>
          <StatChip
            label="정복"
            value="120"
          />
        </Card.Header>
        <Card.Content>본문</Card.Content>
      </Card>
    );

    expect(screen.getByText('아주 긴 카드 제목')).toHaveClass(
      'text-heading-wrap'
    );
    expect(screen.getByText('아주 긴 카드 설명')).toHaveClass('text-two-lines');
    expect(screen.getByText('120')).toHaveClass('numeric-tabular');
  });

  test('DataList는 0건일 때 지정된 빈 상태만 노출한다', () => {
    render(
      <DataList
        emptyState={<EmptyState title="항목이 없어요" />}
        maxVisibleItems={2}
      >
        {[]}
      </DataList>
    );

    expect(screen.getByText('항목이 없어요')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /더 보기/ })).toBeNull();
  });

  test('DataList는 대량 항목을 상한에서 접고 사용자가 펼칠 수 있다', async () => {
    const user = userEvent.setup();

    render(
      <DataList
        emptyState={<EmptyState title="항목이 없어요" />}
        maxVisibleItems={2}
      >
        <div>첫째</div>
        <div>둘째</div>
        <div>셋째</div>
      </DataList>
    );

    expect(screen.queryByText('셋째')).toBeNull();
    await user.click(screen.getByRole('button', { name: '더 보기 (1)' }));
    expect(screen.getByText('셋째')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '접기' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('MediaFrame은 이미지 크기를 컨테이너 안으로 제한한다', () => {
    render(
      <MediaFrame data-testid="media-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="디에듀"
        />
      </MediaFrame>
    );

    expect(screen.getByTestId('media-frame')).toHaveClass('overflow-hidden');
  });
});

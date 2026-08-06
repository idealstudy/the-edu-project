import type { TreeSubjectGroup } from '@/entities/tree';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TreeMap } from '../tree-map';

const node = (
  subject: TreeSubjectGroup['subject'],
  nodeId: string
): TreeSubjectGroup['nodes'][number] => ({
  nodeId,
  parentId: null,
  subject,
  unit: nodeId,
  displayName: nodeId,
  depth: 0,
  masteryScore: 0,
  diagnosedScore: null,
  attemptCount: 0,
  correctCount: 0,
  unitNotePageCount: 0,
  intensity: 'untested',
  stuck: false,
  diagnosedOnly: false,
});

describe('2022 개정 교육과정 과목 표시', () => {
  it('신규 과목 코드를 기타로 강등하지 않고 실제 이름으로 표시한다', () => {
    const groups: TreeSubjectGroup[] = [
      { subject: 'ALGEBRA', nodes: [node('ALGEBRA', '대수 단원')] },
      {
        subject: 'CALCULUS_1',
        nodes: [node('CALCULUS_1', '미적분Ⅰ 단원')],
      },
      {
        subject: 'CALCULUS_2',
        nodes: [node('CALCULUS_2', '미적분Ⅱ 단원')],
      },
    ];

    render(
      <TreeMap
        groups={groups}
        onSelectNode={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /대수/ })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /미적분Ⅰ/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /미적분Ⅱ/ })
    ).toBeInTheDocument();
    expect(screen.queryByText('기타')).not.toBeInTheDocument();
  });
});

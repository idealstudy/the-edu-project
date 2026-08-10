'use client';

import { useMemo } from 'react';

import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib';

type TreeNodePickerProps = {
  value: number[];
  onChange: (nodeIds: number[]) => void;
};

export const TreeNodePicker = ({ value, onChange }: TreeNodePickerProps) => {
  const treeQuery = useMyTreeQuery();
  const nodes = useMemo(
    () => treeQuery.data?.groups.flatMap((group) => group.nodes) ?? [],
    [treeQuery.data]
  );
  const selected = nodes.filter((node) => value.includes(Number(node.nodeId)));

  const toggleNode = (nodeId: number) => {
    onChange(
      value.includes(nodeId)
        ? value.filter((current) => current !== nodeId)
        : [...value, nodeId]
    );
  };

  return (
    <details
      className="relative"
      data-testid="exam-tree-node-picker"
    >
      <summary
        className="border-orange-4 bg-orange-1 text-orange-11 flex h-9 min-w-56 cursor-pointer list-none items-center rounded-md border px-3 text-xs font-bold"
        aria-label="단원 트리에서 여러 단원 고르기"
      >
        {treeQuery.isPending
          ? '단원 불러오는 중'
          : selected.length === 0
            ? '단원 고르기'
            : selected.length === 1
              ? selected[0]?.displayName
              : `${selected[0]?.displayName} 외 ${selected.length - 1}개`}
      </summary>
      <div className="border-gray-4 absolute top-10 left-0 z-30 max-h-72 min-w-72 overflow-y-auto rounded-lg border bg-white p-2 shadow-lg">
        {nodes.map((node) => {
          const nodeId = Number(node.nodeId);
          const checked = value.includes(nodeId);
          return (
            <UnstyledButton
              variant="unstyled"
              size="none"
              key={node.nodeId}
              type="button"
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-xs',
                checked
                  ? 'bg-orange-2 text-orange-11 font-extrabold'
                  : 'text-gray-11 hover:bg-gray-1'
              )}
              style={{
                paddingLeft: `${12 + Math.max(0, node.depth - 1) * 14}px`,
              }}
              onClick={() => toggleNode(nodeId)}
              aria-pressed={checked}
            >
              <span aria-hidden="true">{checked ? '✓' : '○'}</span>
              {node.displayName}
            </UnstyledButton>
          );
        })}
      </div>
    </details>
  );
};

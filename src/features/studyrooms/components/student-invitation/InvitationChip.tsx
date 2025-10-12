import React from 'react';

import { Button } from '@/components/ui/button';

type InvitationChipProps = {
  name: string;
  guardianCount?: number;
  onRemove?: () => void;
};

export const InvitationChip = ({
  name,
  guardianCount = 0,
  onRemove,
}: InvitationChipProps) => {
  return (
    <li
      role="listitem"
      aria-label={`${name}${guardianCount > 0 ? `, 보호자 ${guardianCount}` : ''}`}
      className="bg-line-line1/60 text-md inline-flex w-fit items-center gap-2 rounded-md border border-gray-300 px-3 py-[4px]"
    >
      <p className="text-md font-medium text-gray-900">{name}</p>

      {guardianCount > 0 && (
        <div
          aria-label={`보호자 ${guardianCount}`}
          className="text-system-warning flex items-center gap-2"
        >
          <span
            className="text-[10px] leading-[0]"
            aria-hidden="true"
          >
            ●
          </span>
          <span>보호자 {guardianCount}</span>
        </div>
      )}

      <Button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.();
          }
        }}
        variant="outlined"
        aria-label={`${name}칩 삭제 버튼`}
        className="bg-line-line1/60 h-fit border-none px-2 text-sm"
      >
        <span aria-hidden="true">X</span>
        <span className="sr-only">삭제</span>
      </Button>
    </li>
  );
};

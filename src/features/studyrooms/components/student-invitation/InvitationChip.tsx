import React from 'react';

import { Button } from '@/components/ui/button';

type InvitationChipProps = {
  name: string;
  guardianCount?: number;
  onRemove?: () => void;
};

const InvitationChip = ({
  name,
  guardianCount = 0,
  onRemove,
}: InvitationChipProps) => {
  return (
    <div className="bg-gray-scale-white inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-[4px]">
      <p className="text-sm font-medium text-gray-900">{name}</p>

      {guardianCount > 0 && (
        <div className="text-system-warning flex items-center gap-1 text-[13px]">
          <span className="text-[10px] leading-[0]">●</span>
          <span>보호자 {guardianCount}</span>
        </div>
      )}

      <Button
        onClick={onRemove}
        className="ml-1 text-sm text-gray-500 hover:text-gray-700"
        aria-label="삭제"
      >
        X
      </Button>
    </div>
  );
};

export default InvitationChip;

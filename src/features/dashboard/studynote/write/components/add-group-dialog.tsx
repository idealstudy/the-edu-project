import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TextField } from '@/components/ui/text-field';

/*
 * AddGroupDialog
 *
 * 수업노트 추가하기 모달(Dialog)
 */

type AddGroupDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  showTrigger?: boolean;
};

export const AddGroupDialog = ({
  open,
  onOpenChange,
  showTrigger = false,
}: AddGroupDialogProps) => {
  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
    >
      {showTrigger && (
        <Dialog.Trigger asChild>
          <Button size="small">열기</Button>
        </Dialog.Trigger>
      )}
      <Dialog.Content
        className="w-[598px]"
        aria-describedby={undefined}
      >
        <Dialog.Header>
          <Dialog.Title>수업노트 그룹 추가</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body className="mt-6">
          <TextField
            description={
              <TextField.Description>
                수업노트 그룹으로 여러개의 수업노트를 묶어서 관리할 수 있습니다.
              </TextField.Description>
            }
          >
            <TextField.Input placeholder="수업노트 그룹 이름을 작성해주세요." />
          </TextField>
        </Dialog.Body>
        <Dialog.Footer className="mt-6 justify-end">
          <Dialog.Close asChild>
            <Button
              className="w-[120px]"
              variant="outlined"
              size="small"
            >
              취소
            </Button>
          </Dialog.Close>
          <Button
            className="w-[120px]"
            size="small"
            onClick={async () => {
              // TODO: 1) 값 검증/저장 로직...
              onOpenChange(false);
            }}
          >
            저장
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

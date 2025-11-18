'use client';

import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { TextField } from '@/shared/components/ui/text-field';

import { useCreateNoteGroupMutation } from '../services/query';

/*
 * AddGroupDialog
 *
 * 수업노트 추가하기 모달(Dialog)
 */

type AddGroupDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roomId: number;
  showTrigger?: boolean;
  onCreated: (g: { id: number; title: string }) => void;
};

export const AddGroupDialog = ({
  open,
  onOpenChange,
  roomId,
  showTrigger = false,
  onCreated,
}: AddGroupDialogProps) => {
  const [name, setName] = useState<string>('');
  const { mutateAsync, isPending } = useCreateNoteGroupMutation();

  const onSave = async () => {
    const title = name.trim();
    if (!title) return;
    const created = await mutateAsync({ studyRoomId: roomId, title });
    onCreated(created);
    onOpenChange(false);
    setName('');
  };

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
            <TextField.Input
              placeholder="수업노트 그룹 이름을 작성해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
              autoComplete="off"
            />
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
            type="button"
            size="small"
            onClick={onSave}
            disabled={isPending || !name.trim()}
          >
            {isPending ? '저장중…' : '저장'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

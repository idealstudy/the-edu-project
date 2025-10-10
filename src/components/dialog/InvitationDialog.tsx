'use client';

import { useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TextField } from '@/components/ui/text-field';

export const InvitationDialog = ({
  isOpen,
  placeholder,
  onOpenChange,
  title,
  onSubmit,
  error,
}: {
  isOpen: boolean;
  placeholder: string;
  onOpenChange: () => void;
  title: string;
  onSubmit: (name: string) => void;
  error?: string;
}) => {
  const [name, setName] = useState('');

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content className="w-[798px]">
        <Dialog.Header>
          <Dialog.Title className="text-3xl">{title}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body className="mt-6">
          <TextField error={!!error}>
            <TextField.Input
              placeholder={`${placeholder}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
            />
          </TextField>
          {error && <p className="text-system-warning">{error}</p>}
          <Dialog.Description className="font-headline2-heading mt-4 mb-1 flex items-start gap-2 text-lg font-normal">
            <Image
              src="/common/info.svg"
              alt="alert"
              width={20}
              height={20}
              className="relative top-[5px]"
            />
            <div>
              <p>학생을 초대하면 연결된 보호자는 자동으로 함께 입장합니다.</p>
              <p>
                각 수업 노트는 보호자에게 공개하거나 비공개로 설정할 수
                있습니다.
              </p>
              <p>
                학생과 연결되지 않은 보호자는 스터디룸에 입장할 수 없습니다.
              </p>
            </div>
          </Dialog.Description>
        </Dialog.Body>
        <Dialog.Footer className="mt-6 justify-end">
          <Dialog.Close asChild>
            <Button
              className="w-[140px]"
              disabled={!name.trim() || !!error}
              onClick={() => onSubmit(name)}
            >
              초대하기
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

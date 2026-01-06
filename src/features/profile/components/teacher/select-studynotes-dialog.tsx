import { useReducer } from 'react';

import Image from 'next/image';

import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { Button, Dialog } from '@/shared/components/ui';

export default function SelectStudyNotesDialog() {
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);

  return (
    <>
      <button
        onClick={() =>
          dispatch({
            type: 'OPEN',
            scope: 'note',
            kind: 'select-representative',
          })
        }
        className="cursor-pointer"
      >
        <Image
          src={'/common/settings.svg'}
          alt="대표 수업노트 설정"
          width={24}
          height={24}
        />
      </button>

      <Dialog
        isOpen={dialog.status === 'open'}
        onOpenChange={() => dispatch({ type: 'CLOSE' })}
      >
        <Dialog.Content className="max-w-200">
          <Dialog.Header>
            <div className="flex items-center gap-2">
              <Dialog.Title>대표 수업노트 선택</Dialog.Title>
              <Dialog.Description className="font-caption-normal text-text-sub2 flex gap-1">
                <Image
                  src={'/common/info.svg'}
                  alt="선택 안내"
                  width={12}
                  height={12}
                />
                <span>대표 수업노트는 5개까지 선택가능해요!</span>
              </Dialog.Description>
            </div>
          </Dialog.Header>
          <Dialog.Body>{'body'}</Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close>aaa</Dialog.Close>
            <Button>bbb</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}

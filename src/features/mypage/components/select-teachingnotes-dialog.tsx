'use client';

import { useReducer } from 'react';

import Image from 'next/image';

import {
  useTeacherTeachingNotes,
  useUpdateTeacherNoteRepresentative,
} from '@/features/mypage/hooks/teacher/use-teaching-notes';
import TeachingnotesItem from '@/features/profile/components/teacher/teachingnotes-item';
import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import { Button, Dialog, Input } from '@/shared/components/ui';

export default function SelectTeachingnotesDialog() {
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);

  // TODO 전체 조회 api로 변경 예정
  const { data: teachingnotes } = useTeacherTeachingNotes();

  const { mutate: updateRepresentative } = useUpdateTeacherNoteRepresentative();

  const representativeCount =
    teachingnotes?.filter((n) => n.representative).length ?? 0;

  const toggleNote = (id: number, current: boolean) => {
    if (!current && representativeCount >= 5) return;
    updateRepresentative({ teachingNoteId: id, representative: !current });
  };

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
          width={20}
          height={20}
        />
      </button>

      <Dialog
        isOpen={dialog.status === 'open'}
        onOpenChange={() => dispatch({ type: 'CLOSE' })}
      >
        <Dialog.Content className="flex h-150 max-w-200 flex-col gap-6">
          <Dialog.Header>
            <div className="max-desktop:flex-col flex items-center gap-2">
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
          <Dialog.Body>
            <Input />
            <div className="space-y-3 overflow-y-auto px-3 py-4">
              {teachingnotes &&
                teachingnotes.map((teachingnote) => (
                  <TeachingnotesItem
                    variant="selectable"
                    key={teachingnote.id}
                    teachingnote={teachingnote}
                    checked={teachingnote.representative}
                    onClick={() =>
                      toggleNote(teachingnote.id, teachingnote.representative)
                    }
                  />
                ))}
            </div>
          </Dialog.Body>
          <Dialog.Footer className="self-end">
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outlined"
                size="small"
              >
                취소
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant="primary"
              size="small"
            >
              저장
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}

'use client';

import { useEffect, useReducer, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { FrontendTeacherDescription } from '@/entities/teacher';
import { useUpdateTeacherDescription } from '@/features/mypage/hooks/teacher/use-description';
import { dialogReducer, initialDialogState } from '@/shared/components/dialog';
import {
  TextEditor,
  mergeResolvedContentWithMediaIds,
  parseEditorContent,
  prepareContentForSave,
  useTextEditor,
} from '@/shared/components/editor';
import { Button, Dialog } from '@/shared/components/ui';
import { classifyMypageError, handleApiError } from '@/shared/lib/errors';
import { Pen } from 'lucide-react';

type EditHighlightDialogProps = {
  description?: FrontendTeacherDescription;
};

export default function EditHighlightDialog({
  description,
}: EditHighlightDialogProps) {
  const router = useRouter();
  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);
  const { value, onChange } = useTextEditor();
  const updateTeacherDescriptionMutation = useUpdateTeacherDescription();

  // 값 변경 비교
  const initialValue = useRef<typeof value>(null);
  const isDirty =
    JSON.stringify(value) !== JSON.stringify(initialValue.current);

  useEffect(() => {
    if (!description) return;

    const source = parseEditorContent(description.description || '');
    const resolved = parseEditorContent(
      description.resolvedDescription.content || ''
    );

    const merged = mergeResolvedContentWithMediaIds(source, resolved);
    onChange(merged);

    initialValue.current = merged;

    // onChange는 useTextEditor 내부의 setValue 래퍼로 안정적이나 useCallback으로 감싸지지 않아 eslint-disable 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  const handleSave = () => {
    const { contentString, mediaIds } = prepareContentForSave(value);

    updateTeacherDescriptionMutation.mutate(
      { description: contentString, mediaIds },
      {
        onSuccess: () => {
          dispatch({ type: 'CLOSE' });
        },
        onError: (error) => {
          handleApiError(error, classifyMypageError, {
            onAuth: () => {
              setTimeout(() => {
                router.replace('/login');
              }, 1500);
            },
            onUnknown: () => {},
          });
        },
      }
    );
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
        <Pen />
      </button>

      <Dialog
        isOpen={dialog.status === 'open'}
        onOpenChange={(open) => {
          if (
            !open &&
            isDirty &&
            !window.confirm('작성 중인 내용이 사라집니다. 닫으시겠어요?')
          )
            return;
          if (!open && initialValue.current) onChange(initialValue.current);
          return dispatch({ type: 'CLOSE' });
        }}
      >
        <Dialog.Content className="flex h-150 max-w-200 flex-col gap-6">
          <Dialog.Header>
            <Dialog.Title>선생님 특징 편집</Dialog.Title>
          </Dialog.Header>
          {/* 에디터 내부에만 스크롤이 생기도록 .notion-editor에 직접 스타일링 */}
          <Dialog.Body className="flex min-h-0 flex-1 flex-col overflow-hidden [&_.notion-editor]:min-h-0 [&_.notion-editor]:flex-1 [&_.notion-editor>div:last-child]:min-h-0 [&_.notion-editor>div:last-child]:flex-1">
            <TextEditor
              value={value}
              onChange={onChange}
              placeholder="선생님의 특징을 자유롭게 작성해주세요."
              maxHeight="100%"
            />
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
              variant="secondary"
              size="small"
              onClick={handleSave}
              disabled={updateTeacherDescriptionMutation.isPending || !isDirty}
            >
              저장
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}

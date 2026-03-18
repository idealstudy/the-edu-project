'use client';

import {
  initialTextEditorValue,
  useTextEditor,
} from '@/shared/components/editor';

import { CommentComposer } from './comment-composer';

interface WriteAreaProps {
  teachingNoteId: number;
}

export const CommentWriteArea = ({ teachingNoteId }: WriteAreaProps) => {
  const textEditor = useTextEditor();
  const isPendingName = '댓글';
  return (
    <CommentComposer
      value={textEditor.value}
      onChange={textEditor.onChange}
      teachingNoteId={teachingNoteId}
      parentCommentId={null}
      onSubmitted={() => {
        textEditor.onChange(initialTextEditorValue);
      }}
      isPendingName={isPendingName}
    />
  );
};

'use client';

import Image from 'next/image';

import {
  TextEditor,
  hasMeaningfulEditorContent,
  parseEditorContent,
} from '@/shared/components/editor';
import { Button } from '@/shared/components/ui';
import { JSONContent } from '@tiptap/react';

import { useReadPeoplePopover } from '../hooks/use-read-people-popover';
import { CommantReadPeoplle } from './comment-read-people';

interface CommentAnswerCardContentProps {
  authorName: string;
  roleLabel?: string;
  profileImageSrc: string;
  content: string;
  isEditing: boolean;
  editContent: JSONContent | null | undefined;
  onEditContentChange: (value: JSONContent) => void;
  onCancel: () => void;
}

// 카드의 컨텐츠
export const CommentAnswerCardContent = ({
  authorName,
  roleLabel,
  profileImageSrc,
  content,
  isEditing,
  editContent,
  onEditContentChange,
  onCancel,
}: CommentAnswerCardContentProps) => {
  const initialEditContent = parseEditorContent(content);
  const isReplySubmitDisabled = !hasMeaningfulEditorContent(initialEditContent);

  const { isOpen, side, triggerRef, popupRef, open, close } =
    useReadPeoplePopover();

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="border-gray-12 h-9 w-9 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={profileImageSrc}
                alt="프로필 이미지"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <p className="font-body2-normal text-gray-12">{authorName}</p>
              {roleLabel ? (
                <>
                  <p className="text-gray-7">·</p>
                  <p className="font-body2-normal text-gray-7">{roleLabel}</p>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outlined"
              onClick={onCancel}
              className="font-label-normal disabled:font-label-normal h-[35px] shrink-0 px-6 py-2"
            >
              취소
            </Button>
            <Button
              disabled={isReplySubmitDisabled}
              className="font-label-normal disabled:font-label-normal h-[35px] shrink-0 px-6 py-2"
            >
              수정 완료
            </Button>
          </div>
        </div>
        <TextEditor
          value={editContent ?? initialEditContent}
          onChange={onEditContentChange}
          placeholder="내용을 수정하세요..."
          targetType="TEACHING_NOTE"
          minHeight="120px"
          maxHeight="240px"
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-3">
        <p className="font-body2-normal text-gray-12 leading-6">{content}</p>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <p className="font-label-normal text-gray-5">00일 전 작성</p>
        <div
          ref={triggerRef}
          className="relative"
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <div className="bg-gray-2 font-label-normal text-gray-9 rounded-sm px-1 py-1.5">
            읽음 2
          </div>
          {isOpen ? (
            <div
              ref={popupRef}
              className={`absolute top-1/2 z-10 -translate-y-1/2 ${
                side === 'right' ? 'left-full ml-2' : 'right-full mr-2'
              }`}
              onMouseEnter={open}
              onMouseLeave={close}
            >
              <CommantReadPeoplle />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

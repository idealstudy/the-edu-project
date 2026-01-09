'use client';

import { useState } from 'react';

import Image from 'next/image';

import { TextEditor, TextViewer } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';
import { useRole } from '@/shared/hooks/use-role';
import { getRelativeTimeString } from '@/shared/lib/utils';
import { JSONContent } from '@tiptap/react';

import {
  useDeleteQnAMessageMutation,
  useUpdateQnAMessageMutation,
} from '../../services/query';

type Props = {
  id: number;
  content: string;
  authorName: string;
  regDate: string;
  studyRoomId: number;
  contextId: number;
};

const QuestionContent = ({
  id,
  content,
  authorName,
  regDate,
  studyRoomId,
  contextId,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<JSONContent | null>(null);
  const { role } = useRole();
  const { mutate: updateMessage, isPending: isUpdating } =
    useUpdateQnAMessageMutation(role);
  const { mutate: deleteMessage, isPending: isDeleting } =
    useDeleteQnAMessageMutation(role);

  // JSONContent 파싱
  let parsedContent: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && 'type' in parsed) {
      parsedContent = parsed as JSONContent;
    } else {
      // JSON이지만 JSONContent 형식이 아니면 기본 구조로 변환
      parsedContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: String(content) }],
          },
        ],
      };
    }
  } catch {
    // JSON 파싱 실패 시 기본 구조로 변환
    parsedContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: content }],
        },
      ],
    };
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(parsedContent);
    setIsOpen(false);
  };

  const handleSave = () => {
    if (!editContent) return;
    updateMessage(
      {
        studyRoomId,
        contextId,
        messageId: id,
        content: JSON.stringify(editContent),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setEditContent(null);
          // 쿼리 무효화는 mutation hook에서 처리되므로 라우팅 불필요
          // 같은 페이지에 있으므로 자동으로 업데이트됨
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(null);
  };

  const handleDelete = () => {
    // TODO : 모달 구현 필요
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMessage({
        studyRoomId,
        contextId,
        messageId: id,
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white p-10">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-3">
          <div className="bg-gray-scale-gray-10 h-10 w-10 rounded-full" />
          <span className="font-body2-heading">{authorName}</span>
        </div>
        {role === 'ROLE_STUDENT' && (
          <DropdownMenu
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <DropdownMenu.Trigger className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-gray-100">
              <Image
                src="/studynotes/gray-kebab.svg"
                width={24}
                height={24}
                alt="study-notes"
                className="cursor-pointer"
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="flex min-w-[110px] flex-col items-stretch">
              <DropdownMenu.Item
                className="justify-center"
                onClick={handleEdit}
                disabled={isUpdating || isDeleting}
              >
                {isUpdating ? '수정 중...' : '수정'}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="justify-center"
                variant="danger"
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <TextEditor
            value={editContent || parsedContent}
            onChange={(value) => setEditContent(value)}
            placeholder="내용을 수정하세요..."
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || !editContent}
            >
              {isUpdating ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="font-body2-normal">
            <TextViewer value={parsedContent} />
          </div>
          <span className="font-caption-normal text-gray-scale-gray-60 self-end">
            {getRelativeTimeString(regDate) + ' 작성'}
          </span>
        </>
      )}
    </div>
  );
};

export default QuestionContent;

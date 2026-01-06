import { useState } from 'react';

import Image from 'next/image';

import { TextEditor, TextViewer } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui';
import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';
import { getRelativeTimeString } from '@/shared/lib/utils';
import { JSONContent } from '@tiptap/react';

import {
  useRemoveStudentHomework,
  useUpdateStudentHomework,
} from '../../hooks/student/useStudentHomeworkMutations';
import { parseEditorContent } from '../../lib/parse-editor-content';
import { HOMEWORK_SUBMIT_STATUS_LABEL } from '../../model/constants';
import { HomeworkSubmitStatus } from '../../model/homework.types';

type Props = {
  homeworkStudentId: number;
  content: string;
  authorName: string;
  regDate: string;
  submitStatus?: HomeworkSubmitStatus;

  studyRoomId: number;
  homeworkId: number;
};
// 학생이 과제 제출시 내용 담는 ui
export const StudentSubmissionContent = ({
  homeworkStudentId,
  studyRoomId,
  homeworkId,
  content,
  authorName,
  regDate,
  submitStatus,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<JSONContent | null>(null);
  const [localContent, setLocalContent] = useState(content);

  const parsedContent = parseEditorContent(localContent);

  const { mutate: deleteHomework, isPending: isDeleting } =
    useRemoveStudentHomework();
  const { mutate: updateHomework, isPending: isUpdating } =
    useUpdateStudentHomework();

  const handleUpdate = () => {
    setIsEditing(true);
    setEditContent(parsedContent);
  };

  const handleSave = () => {
    if (!editContent) return;
    updateHomework(
      {
        studyRoomId,
        homeworkStudentId,
        homeworkId,
        content: JSON.stringify(editContent),
      },

      {
        onSuccess: () => {
          setLocalContent(JSON.stringify(editContent));
          setIsEditing(false);
          setEditContent(null);
        },
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(null);
  };

  const handleDelete = () => {
    const isConfirmed = confirm('과제를 삭제하시겠습니까?');

    if (!isConfirmed) return;

    deleteHomework({
      studyRoomId,
      homeworkId,
      homeworkStudentId,
      content,
    });
  };

  return (
    <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white p-10">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100" />
          <span className="font-body2-heading">{authorName}</span>

          {submitStatus && (
            <span className="rounded-full border px-3 py-1 text-xs">
              {HOMEWORK_SUBMIT_STATUS_LABEL[submitStatus]}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenu.Trigger className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-gray-100">
            <Image
              src="/studynotes/gray-kebab.svg"
              width={24}
              height={24}
              alt="study-notes"
              className="cursor-pointer"
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <>
              <DropdownMenu.Item onClick={handleUpdate}>
                {isUpdating ? '수정중...' : '수정하기'}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                variant="danger"
                onClick={() => handleDelete()}
              >
                {isDeleting ? '삭제중...' : '삭제하기'}
              </DropdownMenu.Item>
            </>
          </DropdownMenu.Content>
        </DropdownMenu>
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

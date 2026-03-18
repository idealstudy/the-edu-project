'use client';

import { ColumnLayout } from '@/layout';

import { useCommentList } from '../hooks/use-comment';
import { CommentItem } from './comment-item';
import { CommentWriteArea } from './comment-write-area';

export const StudyNoteDetailCommentSection = ({ id }: { id: string }) => {
  const teachingNoteId = Number(id);
  const { data } = useCommentList(teachingNoteId);

  // 댓글 + 대댓글 길이
  const totalCommentCount =
    data?.reduce((count, comment) => count + comment.children.length, 0) ?? 0;

  return (
    <ColumnLayout.Bottom className="space-y-4">
      <section>
        <div className="flex items-center gap-1 text-center">
          <p className="font-body1-heading text-gray-12">댓글</p>
          <p className="font-body1-heading text-orange-7">
            {totalCommentCount}
          </p>
        </div>
      </section>

      <CommentWriteArea teachingNoteId={teachingNoteId} />

      {data?.map((comment) => (
        <div
          key={comment.id}
          className="space-y-4"
        >
          <CommentItem
            teachingNoteId={teachingNoteId}
            comment={comment}
          />
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              teachingNoteId={teachingNoteId}
              comment={child}
              showReplyArrow
            />
          ))}
        </div>
      ))}
    </ColumnLayout.Bottom>
  );
};

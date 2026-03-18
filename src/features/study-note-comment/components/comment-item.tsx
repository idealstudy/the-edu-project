'use client';

import {
  CommentChildItemDTO,
  CommentItemDTO,
} from '@/entities/study-note-comment';

import { CommentCard } from './comment-card';

type CommentCardItem = CommentItemDTO | CommentChildItemDTO;

interface CommentItemProps {
  teachingNoteId: number;
  comment: CommentCardItem;
  showReplyArrow?: boolean;
}

export const CommentItem = ({
  teachingNoteId,
  comment,
  showReplyArrow = false,
}: CommentItemProps) => {
  const isStudent = comment.authorInfo.role === 'ROLE_STUDENT';
  const roleLabel = isStudent ? '학생' : '선생님';
  const profileImageSrc = isStudent
    ? '/character/img_profile_student01.png'
    : '/character/img_profile_teacher01.png';

  return (
    <CommentCard
      authorName={comment.authorInfo.name}
      roleLabel={roleLabel}
      content={comment.resolvedContent.content}
      expiredAt={comment.resolvedContent.expiresAt}
      readCount={comment.readCount}
      showReplyArrow={showReplyArrow}
      profileImageSrc={profileImageSrc}
      teachingNoteId={teachingNoteId}
      commentId={comment.id}
    />
  );
};

import { base } from '@/entities/notification/schema';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * category -> 한글 변환 매핑
 * ────────────────────────────────────────────────────*/
const CATEGORY_TO_KOREAN: Record<string, string> = {
  SYSTEM: '공지사항',
  HOMEWORK: '과제',
  TEACHING_NOTE: '수업노트',
  STUDY_ROOM: '스터디룸 초대',
  QNA: '질문',
};

const getCategoryKorean = (category: string): string =>
  CATEGORY_TO_KOREAN[category as keyof typeof CATEGORY_TO_KOREAN] || '기타';

/* ─────────────────────────────────────────────────────
 * category -> URL 변환 매핑
 * ────────────────────────────────────────────────────*/
const getTargetUrl = (
  category: string,
  metadata: {
    qnaId?: string;
    studyRoomId?: string;
    teachingNoteId?: string;
    noticeId?: string;
    homeworkId?: string;
  }
): string | null => {
  switch (category) {
    case 'TEACHING_NOTE':
      return `/study-rooms/${metadata.studyRoomId}/note/${metadata.teachingNoteId}`;
    case 'STUDY_ROOM':
      return `/study-rooms/${metadata.studyRoomId}/note`;
    case 'QNA':
      return `/study-rooms/${metadata.studyRoomId}/qna/${metadata.qnaId}`;
    // TODO
    case 'HOMEWORK':
    case 'SYSTEM':
    default:
      return null;
  }
};

/* ─────────────────────────────────────────────────────
 * base 스키마를 가공하여 도메인 기본 구조 생성
 * - regDate를 Date 객체로 변환
 * - nullable 처리
 * ────────────────────────────────────────────────────*/
const NotificationShape = base.schema
  .partial()
  .required({
    id: true,
    message: true,
    category: true,
    targetMetadata: true,
    read: true,
  })
  .extend({
    regDate: z.preprocess((val) => {
      if (!val) return new Date();
      return typeof val === 'string' ? new Date(val) : val;
    }, z.date()),
  });

/* ─────────────────────────────────────────────────────
 * shape에 transform 추가하여 추가 필드 생성
 * - category 추가: type을 한글로 변환
 * - relativeTime 추가: '0시간 전' 형식
 * - isRead 추가
 * ────────────────────────────────────────────────────*/
const NotificationSchema = NotificationShape.transform((notification) => ({
  ...notification,
  categoryKorean: getCategoryKorean(notification.category),
  targetUrl: getTargetUrl(notification.category, notification.targetMetadata),
  relativeTime: formatDistanceToNow(notification.regDate, {
    addSuffix: true,
    locale: ko,
  }),
  isRead: notification.read,
}));

export const domain = {
  schema: NotificationSchema,
  shape: NotificationShape,
  category: base.category,
};

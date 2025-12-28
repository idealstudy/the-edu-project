import { base } from '@/entities/notification/schema';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * category -> 한글 변환 매핑
 * ────────────────────────────────────────────────────*/
const CATEGORY_TO_KOREAN = {
  TEACHING_NOTE: '수업노트',
  SYSTEM: '공지사항',
  CONNECTION_REQUEST: '연결 요청',
};

const getCategoryKorean = (type: string): string =>
  CATEGORY_TO_KOREAN[type as keyof typeof CATEGORY_TO_KOREAN];

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
    targetId: true,
    isRead: true,
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
  relativeTime: formatDistanceToNow(notification.regDate, {
    addSuffix: true,
    locale: ko,
  }),
}));

export const domain = {
  schema: NotificationSchema,
  shape: NotificationShape,
  category: base.category,
};

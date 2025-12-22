import { domain } from '@/entities/notification/core';
import { NotificationDTO } from '@/entities/notification/types';

/* ─────────────────────────────────────────────────────
 * DTO -> Domain 변환
 * domain.schema가 자동으로 변환 수행:
 * - regDate: string -> Date
 * - category 추가
 * - relativeTime 추가
 * - isRead 추가
 * ────────────────────────────────────────────────────*/
export const notificationMapper = {
  toDomain: (dto: NotificationDTO) => domain.schema.parse(dto),

  toDomianList: (dtos: NotificationDTO[]) =>
    dtos.map(notificationMapper.toDomain),
};

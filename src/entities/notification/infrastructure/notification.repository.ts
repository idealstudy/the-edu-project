import { domain } from '@/entities/notification/core';
import {
  FrontendNotification,
  NotificationDTO,
} from '@/entities/notification/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { CommonResponse } from '@/types';

import { dto } from './notification.dto';

/* ─────────────────────────────────────────────────────
 * [Read] 알림 목록 조회
 * ────────────────────────────────────────────────────*/
const getNotificationList = async (): Promise<FrontendNotification[]> => {
  const response =
    await api.private.get<CommonResponse<NotificationDTO[]>>(
      '/notification/all'
    );
  const dtos = unwrapEnvelope(response, dto.arraySchema);
  return dtos.map((dto) => domain.schema.parse(dto));
};

/* ─────────────────────────────────────────────────────
 * [Read] 미확인 알림 조회
 * ────────────────────────────────────────────────────*/
const getUnreadNotifications = async () => {
  const response = await api.private.get('/notification/unread');
  const dtos = unwrapEnvelope(response, dto.arraySchema);
  return dtos.map((dto) => domain.schema.parse(dto));
};

/* ─────────────────────────────────────────────────────
 * [Update] 알림 읽음 처리
 * ────────────────────────────────────────────────────*/
const markAsRead = async (notificationIds: number[]): Promise<void> => {
  await api.private.patch('/notification/read', { notificationIds });
};

/* ─────────────────────────────────────────────────────
 * [Delete] 알림 삭제
 * ────────────────────────────────────────────────────*/
const deleteNotifications = async (
  notificationIds: number[]
): Promise<void> => {
  await api.private.delete('/notification', {
    data: { notificationIds },
  });
};

export const repository = {
  notification: {
    getList: getNotificationList,
    getUnread: getUnreadNotifications,
    markAsRead: markAsRead,
    delete: deleteNotifications,
  },
};

import { notificationMapper } from '@/entities/notification/mapper';
import {
  FrontendNotification,
  NotificationDTO,
} from '@/entities/notification/types';
import { api } from '@/shared/api';
import { CommonResponse } from '@/types';

import { adapters } from './notification.adapters';

/* ─────────────────────────────────────────────────────
 * [Read] 알림 목록 조회
 * ────────────────────────────────────────────────────*/
const getNotificationList = async (): Promise<FrontendNotification[]> => {
  const response =
    await api.private.get<CommonResponse<NotificationDTO[]>>(
      '/notification/all'
    );
  const validatedResponse = adapters.fromApi.parse(response);
  return notificationMapper.toDomainList(validatedResponse.data ?? []);
};

/* ─────────────────────────────────────────────────────
 * [Read] 미확인 알림 조회
 * ────────────────────────────────────────────────────*/
const getUnreadNotifications = async () => {
  const response = await api.private.get('/notification/unread');
  const validatedResponse = adapters.fromApi.parse(response);
  return notificationMapper.toDomainList(validatedResponse.data ?? []);
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

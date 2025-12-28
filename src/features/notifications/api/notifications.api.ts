import { repository } from '@/entities/notification';

export const notificationsApi = {
  /**
   * 알림 목록 조회
   * @returns FrontendNotification[]
   */
  getList: () => repository.notification.getList(),
  /**
   * 알림 읽음 처리
   * @param notificationIds number[] 읽음처리할 알림 id 배열
   */
  markAsRead: (notificationIds: number[]) =>
    repository.notification.markAsRead(notificationIds),
};

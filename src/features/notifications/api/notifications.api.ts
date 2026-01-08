import { repository } from '@/entities/notification';

export const notificationsApi = {
  /**
   * 알림 목록 조회
   * @returns FrontendNotification[]
   */
  getList: () => repository.notification.getList(),
  /**
   * 미확인 알림 조회
   * @returns FrontendNotification[]
   */
  getUnread: () => repository.notification.getUnread(),
  /**
   * 알림 읽음 처리
   * @param notificationIds 읽음처리할 알림 id 배열
   */
  markAsRead: (notificationIds: number[]) =>
    repository.notification.markAsRead(notificationIds),
  /**
   * 알림 삭제
   * @param notificationIds 삭제할 알림 id 배열
   */
  delete: (notificationIds: number[]) =>
    repository.notification.delete(notificationIds),
};

import { repository } from '@/entities/notification';

export const notificationsApi = {
  /**
   * 알림 목록 조회
   * @returns FrontendNotification[]
   */
  getList: () => repository.notification.getList(),
};

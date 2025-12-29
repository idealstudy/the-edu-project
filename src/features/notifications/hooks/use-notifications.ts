import { notificationKeys } from '@/entities/notification';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { useQuery } from '@tanstack/react-query';

const FIVE_MINUTES = 1000 * 60 * 5;

// Query: 알림 목록 조회
export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: notificationsApi.getList,
    staleTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
  });

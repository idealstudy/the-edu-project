import { notificationKeys, repository } from '@/entities/notification';
import { FrontendNotification } from '@/entities/notification/types';
import { queryOptions, useQuery } from '@tanstack/react-query';

const FIVE_MINUTES = 1000 * 60 * 5;

/* ─────────────────────────────────────────────────────
 * Query Options
 * ────────────────────────────────────────────────────*/
export const getNotificationListOptions = () =>
  queryOptions<FrontendNotification[]>({
    queryKey: notificationKeys.list(),
    queryFn: repository.notification.getList,
    staleTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
  });

/* ─────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────*/
export const useNotificationQuery = () => {
  return useQuery(getNotificationListOptions());
};

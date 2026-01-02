import { notificationKeys } from '@/entities/notification';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const ONE_MINUTE = 60 * 1000;

// Query: 알림 목록 조회
// TODO SSE 전환 예정
export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: notificationsApi.getList,
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
    refetchOnWindowFocus: true,
  });

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      notificationsApi.markAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: number[]) =>
      notificationsApi.delete(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

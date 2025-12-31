'use client';

import { useRouter } from 'next/navigation';

import { FrontendNotification } from '@/entities/notification';
import NotificationIcon from '@/features/notifications/components/notification-icon';
import {
  useDeleteNotifications,
  useMarkAsRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { trackGnbAlarmClick } from '@/shared/lib/gtm/trackers';
import { cn } from '@/shared/lib/utils';
import { useMemberStore } from '@/store';

type NotificationPopoverProps = {
  defaultOpen?: boolean;
};

export function NotificationPopover({
  defaultOpen = false,
}: NotificationPopoverProps) {
  const router = useRouter();

  const { data, isLoading, error } = useNotifications();
  const session = useMemberStore((s) => s.member);
  const markAsRead = useMarkAsRead();
  const deleteNotifications = useDeleteNotifications();

  const notifications = data ?? [];
  const hasNotifications = notifications.length > 0;

  // 개별 읽음 처리
  const handleNotificationClick = (notification: FrontendNotification) => {
    if (!notification.isRead) markAsRead.mutate([notification.id]);
    if (notification.targetUrl) router.push(notification.targetUrl);
  };

  // TODO 전체 읽음 처리
  const handleMarkAllRead = () => {};

  // 개별 삭제
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    deleteNotifications.mutate([id]);
  };

  // TODO 전체 삭제
  const handleDeleteAll = () => {
    if (!hasNotifications) return;
  };

  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex size-6 cursor-pointer items-center justify-center outline-none"
          aria-label="알림 확인"
          onClick={() => {
            // GNB 알림 아이콘 클릭 이벤트 전송
            trackGnbAlarmClick(session?.role ?? null);
          }}
        >
          <NotificationIcon hasNotifications={hasNotifications} />
          <span className="sr-only">알림</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="mr-4 overflow-hidden p-0">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">알림</h2>
          <PopoverClose asChild>
            <button
              type="button"
              className="cursor-pointer text-sm text-gray-500 hover:text-gray-700"
            >
              닫기
            </button>
          </PopoverClose>
        </header>

        {isLoading && (
          <div className="flex h-[200px] items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
            <p>알림을 불러오는 중..</p>
          </div>
        )}

        {error && (
          <div className="flex h-[200px] items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
            <p>알림을 불러오는데 실패했습니다.</p>
          </div>
        )}

        {!isLoading && !error && hasNotifications && (
          <ul className="max-h-[320px] overflow-y-auto bg-white">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex items-start justify-between border-b px-6 py-4 transition-colors',
                  'hover:bg-gray-50'
                )}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex-1">
                  <p
                    className={`text-xs font-semibold text-gray-500 ${item.isRead ? 'font-body2-normal' : 'font-body2-heading'}`}
                  >
                    {item.categoryKorean}
                  </p>
                  <p
                    className={`mt-1 text-sm leading-relaxed text-gray-900 ${item.isRead ? 'font-body2-normal' : 'font-body2-heading'}`}
                  >
                    {item.message}
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-3">
                  <span className="text-xs text-gray-400">
                    {item.relativeTime}
                  </span>
                  <button
                    type="button"
                    className="text-gray-300 hover:text-gray-500"
                    aria-label="알림 삭제"
                    onClick={(event) => handleDelete(item.id, event)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && !hasNotifications && (
          <div className="flex h-[200px] items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
            <p>최근 90일 동안 받은 알림이 없어요.</p>
          </div>
        )}

        <footer className="flex items-center justify-between border-t bg-gray-900 px-6 py-4 text-sm text-white">
          <div>
            <button
              type="button"
              className="cursor-pointer hover:underline"
              onClick={handleDeleteAll}
            >
              전체 삭제
            </button>
            <span aria-hidden> | </span>
            <button
              type="button"
              className="cursor-pointer hover:underline"
              onClick={handleMarkAllRead}
            >
              전체 읽음
            </button>
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 hover:underline"
            aria-label="알림 설정"
          >
            ⚙️ 알림 설정
          </button>
        </footer>
      </PopoverContent>
    </Popover>
  );
}

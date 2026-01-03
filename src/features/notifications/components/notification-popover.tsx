'use client';

import { useEffect, useReducer, useState } from 'react';

import { useRouter } from 'next/navigation';

import { FrontendNotification } from '@/entities/notification';
import NotificationIcon from '@/features/notifications/components/notification-icon';
import {
  useDeleteNotifications,
  useMarkAsRead,
  useNotifications,
  useUnreadNotifications,
} from '@/features/notifications/hooks/use-notifications';
import {
  ConfirmDialog,
  dialogReducer,
  initialDialogState,
} from '@/shared/components/dialog';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { trackGnbAlarmClick } from '@/shared/lib/gtm/trackers';
import { cn } from '@/shared/lib/utils';
import { useMemberStore } from '@/store';

export function NotificationPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const session = useMemberStore((s) => s.member);
  const { data, isLoading, error, refetch } = useNotifications();
  const { data: unread, refetch: refetchUnread } = useUnreadNotifications();
  const markAsRead = useMarkAsRead();
  const deleteNotifications = useDeleteNotifications();

  const notifications = data ?? [];
  const hasNotifications = notifications.length > 0;
  const unreadCount = unread?.length ?? 0;

  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refetch();
      refetchUnread();
    }
  }, [isOpen, refetch, refetchUnread]);

  // 개별 읽음 처리
  const handleNotificationClick = (notification: FrontendNotification) => {
    if (!notification.isRead) markAsRead.mutate([notification.id]);
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
      setIsOpen(false);
    }
  };

  // 전체 읽음 처리
  const handleMarkAllRead = () => {
    if (!unreadCount) return;

    const unreadIds = unread?.map((n) => n.id) ?? [];
    markAsRead.mutate(unreadIds);
  };

  // 개별 삭제
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    deleteNotifications.mutate([id]);
  };

  // 전체 삭제
  const handleDeleteAll = () => {
    if (!hasNotifications) return;

    const allIds = notifications.map((n) => n.id) ?? [];
    deleteNotifications.mutate(allIds);

    dispatch({ type: 'GO_TO_CONFIRM' });
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
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

        <PopoverContent className="mr-4 max-w-80 overflow-hidden p-0">
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
            <div className="flex h-50 items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
              <p>알림을 불러오는 중..</p>
            </div>
          )}

          {error && (
            <div className="flex h-50 items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
              <p>알림을 불러오는데 실패했습니다.</p>
            </div>
          )}

          {!isLoading && !error && hasNotifications && (
            <ul className="max-h-80 overflow-y-auto bg-white">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer items-start justify-between border-b px-6 py-4 transition-colors',
                    'hover:bg-gray-100'
                  )}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-text-sub2 text-xs font-semibold">
                      {item.categoryKorean}
                    </p>
                    <p
                      className={`mt-1 truncate text-sm leading-relaxed hover:underline ${item.isRead ? 'font-body2-normal text-text-sub2' : 'font-body2-heading'}`}
                    >
                      {item.message}
                    </p>
                  </div>
                  <div className="ml-3 flex flex-col items-end">
                    <span className="text-xs text-gray-400">
                      {item.relativeTime}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer p-1 text-gray-300 hover:text-gray-500"
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
            <div className="flex h-50 items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
              <p>최근 90일 동안 받은 알림이 없어요.</p>
            </div>
          )}

          <footer className="flex items-center justify-between border-t bg-gray-900 px-6 py-4 text-sm text-white">
            <div>
              <button
                type="button"
                className="cursor-pointer hover:underline"
                onClick={() => {
                  dispatch({
                    type: 'OPEN',
                    scope: 'notification',
                    kind: 'delete',
                  });
                  setIsDialogOpen(true);
                }}
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

      {dialog.status === 'open' && dialog.kind === 'delete' && (
        <ConfirmDialog
          variant="delete"
          open={isDialogOpen}
          dispatch={dispatch}
          onConfirm={handleDeleteAll}
          emphasis="none"
          title="전체 알림을 삭제하시겠습니까?"
          description="삭제된 알림은 복구할 수 없습니다."
        />
      )}

      {dialog.status === 'open' && dialog.kind === 'onConfirm' && (
        <ConfirmDialog
          variant="confirm"
          open={isDialogOpen}
          dispatch={dispatch}
          onConfirm={() => setIsDialogOpen(false)}
          title="전체 알림이 삭제되었습니다."
        />
      )}
    </>
  );
}

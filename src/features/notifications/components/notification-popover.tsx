'use client';

import { useMemo } from 'react';

import Image from 'next/image';

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

type NotificationItem = {
  id: string;
  category: '수업노트' | '질문/답변' | '과제' | '공지';
  message: string;
  createdAt: string; // “3시간 전” 같은 표현
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    category: '수업노트',
    message: '〇〇〇 선생님이 새로운 수업노트를 작성했습니다.',
    createdAt: '3시간 전',
  },
  {
    id: '2',
    category: '질문/답변',
    message: '〇〇〇 선생님이 새로운 과제를 생성했습니다.',
    createdAt: '3시간 전',
  },
  {
    id: '3',
    category: '과제',
    message: '〇〇〇 선생님이 새로운 과제를 생성했습니다.',
    createdAt: '3시간 전',
  },
];

type NotificationPopoverProps = {
  defaultOpen?: boolean;
};

export function NotificationPopover({
  defaultOpen = false,
}: NotificationPopoverProps) {
  const notifications = useMemo(() => MOCK_NOTIFICATIONS, []);
  const hasNotifications = notifications.length > 0;

  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex size-6 items-center justify-center outline-none"
          aria-label="알림 확인"
        >
          <Image
            src="/img_header_bell.svg"
            alt="알림"
            width={24}
            height={24}
          />
          <span className="sr-only">알림</span>
          {/* 필요 시 배지 */}
        </button>
      </PopoverTrigger>

      <PopoverContent className="overflow-hidden p-0">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">알림</h2>
          <PopoverClose asChild>
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              닫기
            </button>
          </PopoverClose>
        </header>

        {hasNotifications ? (
          <ul className="max-h-[320px] overflow-y-auto bg-white">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex items-start justify-between border-b px-6 py-4 transition-colors',
                  'hover:bg-gray-50'
                )}
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500">
                    {item.category}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-900">
                    {item.message}
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-3">
                  <span className="text-xs text-gray-400">
                    {item.createdAt}
                  </span>
                  <button
                    type="button"
                    className="text-gray-300 hover:text-gray-500"
                    aria-label="알림 삭제"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-[200px] items-center justify-center bg-white px-6 py-12 text-sm text-gray-500">
            최근 90일 동안 받은 알림이 없어요.
          </div>
        )}

        <footer className="flex items-center justify-between border-t bg-gray-900 px-6 py-4 text-sm text-white">
          <button
            type="button"
            className="hover:underline"
          >
            전체 삭제
          </button>
          <button
            type="button"
            className="flex items-center gap-2 hover:underline"
          >
            ⚙️ 알림 설정
          </button>
        </footer>
      </PopoverContent>
    </Popover>
  );
}

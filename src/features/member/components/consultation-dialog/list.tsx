'use client';

import { ChevronRight } from 'lucide-react';

import { ConsultationDialogLayout, ConsultationTabNav } from '.';

type ConsultationItem = {
  id: string;
  date: string;
  preview: string;
};

type Props = {
  studentName: string;
  isOpen: boolean;
  isTeacher: boolean;
  onClose: () => void;
  onTabChange: (tab: 'write' | 'list') => void;
  onSelectItem: (id: string) => void;
  items: ConsultationItem[];
  hasMore: boolean;
  onLoadMore: () => void;
};

export const ConsultationList = ({
  studentName,
  isOpen,
  isTeacher,
  onClose,
  onTabChange,
  onSelectItem,
  items,
  hasMore,
  onLoadMore,
}: Props) => {
  return (
    <ConsultationDialogLayout
      isOpen={isOpen}
      onClose={onClose}
      title={`${studentName} 학생 기록 일지`}
      navigation={
        isTeacher ? (
          <ConsultationTabNav
            activeTab="list"
            onTabChange={onTabChange}
          />
        ) : undefined
      }
    >
      <p className="font-body2-heading text-gray-12 mb-4">
        {items.length}개의 기록 일지
      </p>

      {items.length === 0 && (
        <p className="font-body2-normal text-gray-7">
          첫번째 기록 일지를 작성해보세요.
        </p>
      )}

      <ul className="flex flex-col pr-1">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="group mb-4 flex items-stretch gap-3"
          >
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-3 group-hover:bg-orange-3 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full transition-colors">
                <div className="bg-gray-6 group-hover:bg-orange-6 h-3 w-3 rounded-full" />
              </div>

              {index < items.length - 1 && (
                <div className="bg-gray-3 group-hover:bg-orange-3 mt-1 w-px flex-1 transition-colors" />
              )}
            </div>

            {/* Card */}
            <button
              type="button"
              onClick={() => onSelectItem(item.id)}
              className="border-line-line1 group-hover:border-orange-3 group-hover:bg-orange-1 flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-caption-normal text-gray-7 group-hover:text-orange-6 mb-1 transition-colors">
                  {item.date}
                </p>
                <p className="font-body2-normal text-gray-10 line-clamp-3">
                  {item.preview}
                </p>
              </div>
              <ChevronRight
                className="text-gray-5 group-hover:text-orange-5 shrink-0 transition-colors"
                size={20}
              />
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="font-body2-normal text-gray-7 hover:text-gray-10 mt-2 w-full py-2 transition-colors"
        >
          더 보기
        </button>
      )}
    </ConsultationDialogLayout>
  );
};

'use client';

import { useState } from 'react';

import Image from 'next/image';

import EllipsisIcon from '@/assets/icons/ellipsis-vertical.svg';
import { TextViewer } from '@/components/editor';
import { ColumnLayout } from '@/components/layout/column-layout';
import { useStudyNoteDetailQuery } from '@/features/dashboard/studynote/detail/service/query';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const StudyNoteDetailContentsSection = ({ id }: { id: string }) => {
  const { data } = useStudyNoteDetailQuery(Number(id));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!data) return null;

  const contentString = data.resolvedContent?.content || data.content;
  const content = JSON.parse(contentString);
  const formattedDate = format(
    new Date(data.taughtAt),
    'yyyy. MM. dd (E) 수업',
    {
      locale: ko,
    }
  );

  const handleEdit = () => {
    // TODO: 편집 기능 구현
  };

  const handleDelete = () => {
    // TODO: 삭제 기능 구현
  };

  return (
    <ColumnLayout.Right className="border-line-line1 max-h-[calc(100vh-var(--spacing-header-height)-48px)] overflow-y-auto rounded-xl border bg-white px-8 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div className="bg-background-orange text-key-color-primary font-body2-normal flex w-fit items-center gap-2 rounded-lg px-2 py-1">
          <Image
            src="/studynotes/cal.svg"
            alt="calendar"
            width={14}
            height={14}
          />
          <span>{formattedDate}</span>
        </div>

        {/* 메뉴 버튼 */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-text-sub2 hover:text-text-main rounded p-1 transition-colors"
            aria-label="메뉴"
          >
            <EllipsisIcon className="h-5 w-5" />
          </button>

          {/* 드롭다운 메뉴 */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="border-line-line1 absolute top-8 right-0 z-20 w-32 overflow-hidden rounded-lg border bg-white shadow-lg">
                <button
                  onClick={() => {
                    handleEdit();
                    setIsMenuOpen(false);
                  }}
                  className="text-text-main hover:bg-background-gray font-body2-normal w-full px-4 py-3 text-center transition-colors"
                >
                  편집하기
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setIsMenuOpen(false);
                  }}
                  className="text-key-color-primary hover:bg-background-gray font-body2-normal w-full px-4 py-3 text-center transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <TextViewer value={content} />
    </ColumnLayout.Right>
  );
};

export default StudyNoteDetailContentsSection;

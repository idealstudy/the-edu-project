'use client';

import { useParams } from 'next/navigation';

import BackLink from '@/features/dashboard/studynote/components/back-link';
import { ColumnLayout } from '@/layout/column-layout';
import { TextViewer } from '@/shared/components/editor';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BookOpen, Tag } from 'lucide-react';

// TODO: API 연동 시 제거
const MOCK_STUDENT_STUDY_NOTE = {
  id: 1,
  title: '수학 오답노트하기',
  subject: '수학',
  studiedAt: '2025-07-13T00:00:00',
  content: JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph' }],
  }),
};

const StudentStudyNoteDetailPage = () => {
  useParams();

  const data = MOCK_STUDENT_STUDY_NOTE;

  const formattedDate = data.studiedAt
    ? format(new Date(data.studiedAt), 'yyyy. MM. dd (E)', { locale: ko })
    : null;

  let content: unknown = null;
  try {
    if (data.content) content = JSON.parse(data.content);
  } catch {
    content = null;
  }

  return (
    <ColumnLayout className="tablet:flex-col desktop:flex-col flex flex-col gap-0">
      <BackLink className="mb-6" />
      <ColumnLayout className="desktop:px-0 items-start gap-6 p-0">
        <ColumnLayout.Left className="border-line-line1 !static top-0 h-fit space-y-5 rounded-xl border bg-white p-10">
          <h1 className="font-headline1-heading text-text-main">
            {data.title}
          </h1>

          <hr className="border-line-line1 border" />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="bg-background-gray text-text-sub2 font-label-normal flex w-fit items-center gap-2 rounded-lg px-3 py-2">
                <Tag size={14} />
                <span>과목</span>
              </div>
              <p className="font-body2-normal text-text-main">{data.subject}</p>
            </div>

            {formattedDate && (
              <div className="space-y-2">
                <div className="bg-background-gray text-text-sub2 font-label-normal flex w-fit items-center gap-2 rounded-lg px-3 py-2">
                  <BookOpen size={14} />
                  <span>학습 날짜</span>
                </div>
                <p className="font-body2-normal text-text-main">
                  {formattedDate}
                </p>
              </div>
            )}
          </div>
        </ColumnLayout.Left>

        <ColumnLayout.Right className="border-line-line1 desktop:max-w-[740px] max-h-[calc(100vh-var(--spacing-header-height)-48px)] overflow-y-auto rounded-xl border bg-white px-8 py-10">
          {content ? (
            <TextViewer value={content} />
          ) : (
            <p className="font-body2-normal text-gray-8">
              작성된 내용이 없어요.
            </p>
          )}
        </ColumnLayout.Right>
      </ColumnLayout>
    </ColumnLayout>
  );
};

export default StudentStudyNoteDetailPage;

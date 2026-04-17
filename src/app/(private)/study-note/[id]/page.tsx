'use client';

import { useParams } from 'next/navigation';

import BackLink from '@/features/dashboard/studynote/components/back-link';
import { useStudentNoteDetail } from '@/features/student-study-note/hooks';
import { ColumnLayout } from '@/layout/column-layout';
import { TextViewer } from '@/shared/components/editor';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BookOpen, Tag } from 'lucide-react';

const StudentStudyNoteDetailPage = () => {
  const params = useParams();
  const noteId = Number(params.id);

  const { data, isPending } = useStudentNoteDetail(noteId);

  const formattedDate = data?.regDate
    ? format(new Date(data.regDate), 'yyyy. MM. dd (E)', { locale: ko })
    : null;

  const resolvedContent = data?.resolvedContent?.content ?? data?.content;
  let content: unknown = null;
  try {
    if (resolvedContent) content = JSON.parse(resolvedContent);
  } catch {
    content = null;
  }

  if (isPending) {
    return (
      <ColumnLayout className="tablet:flex-col desktop:flex-col flex flex-col gap-0">
        <BackLink className="mb-6" />
        <div className="border-line-line1 h-64 w-full animate-pulse rounded-xl border bg-white" />
      </ColumnLayout>
    );
  }

  return (
    <ColumnLayout className="tablet:flex-col desktop:flex-col flex flex-col gap-0">
      <BackLink className="mb-6" />
      <ColumnLayout className="desktop:px-0 items-start gap-6 p-0">
        <ColumnLayout.Left className="border-line-line1 !static top-0 h-fit space-y-5 rounded-xl border bg-white p-10">
          <h1 className="font-headline1-heading text-text-main">
            {data?.title}
          </h1>

          <hr className="border-line-line1 border" />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="bg-background-gray text-text-sub2 font-label-normal flex w-fit items-center gap-2 rounded-lg px-3 py-2">
                <Tag size={14} />
                <span>과목</span>
              </div>
              <p className="font-body2-normal text-text-main">
                {data?.subject}
              </p>
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

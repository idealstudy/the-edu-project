'use client';

import React, { useEffect } from 'react';

import { useParams, usePathname, useRouter } from 'next/navigation';

import { StudyNoteTab } from '@/features/study-notes/components/study-note-tab';
import StudyNoteTabShell from '@/features/study-notes/components/study-note-tab-shell';
import { StudyroomSidebar } from '@/features/study-rooms/components/sidebar';
import { ColumnLayout } from '@/layout/column-layout';
import { useRole } from '@/shared/hooks/use-role';

type LayoutProps = {
  children: React.ReactNode;
};

const StudyNoteLayout = ({ children }: LayoutProps) => {
  const { role, isLoading } = useRole();
  const path = usePathname();
  const params = useParams();
  const router = useRouter();
  const studyRoomId = Number(params.id);

  // URL에서 segment 추출: /study-rooms/1/qna/4 -> '4'
  const pathSegments = path.split('/').filter(Boolean);
  const segment = pathSegments[pathSegments.length - 1];
  const secondLastSegment = pathSegments[pathSegments.length - 2];

  // 상세 페이지인지 확인 (note/[noteId] 또는 qna/[contextId])
  const isDetailPage =
    (pathSegments.length > 3 && secondLastSegment === 'qna') ||
    (pathSegments.length > 3 && secondLastSegment === 'note');

  // 권한 체크
  // Todo: 추후 미들웨어에서 처리하도록 변경
  useEffect(() => {
    if (isLoading) return;
    if (segment === 'member' && role !== 'ROLE_TEACHER') {
      router.replace(`/`);
    }
  }, [role, segment, isLoading, router, studyRoomId]);

  // 상세 페이지는 sidebar 없이 전체 레이아웃 사용
  if (isDetailPage) {
    return (
      <ColumnLayout className="items-start gap-6 p-6">{children}</ColumnLayout>
    );
  }

  return (
    <ColumnLayout>
      <ColumnLayout.Left>
        <StudyroomSidebar
          studyRoomId={studyRoomId}
          segment={segment}
        />
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] flex h-[400px] flex-col gap-3 rounded-[12px] px-8">
        <div>
          <StudyNoteTab
            mode={role}
            studyRoomId={studyRoomId}
            path={segment!}
          />
          <div className="border-line-line1 flex flex-col gap-9 rounded-tr-[12px] rounded-b-[12px] border bg-white p-8">
            <StudyNoteTabShell
              mode={role}
              path={segment!}
              studyRoomId={studyRoomId}
            />
            {segment !== 'note' && children}
          </div>
        </div>
        {segment === 'note' && children}
      </ColumnLayout.Right>
    </ColumnLayout>
  );
};

export default StudyNoteLayout;

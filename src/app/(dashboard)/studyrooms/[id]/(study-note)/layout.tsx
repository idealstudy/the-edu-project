'use client';

import React from 'react';

import { useParams, usePathname } from 'next/navigation';

import { ColumnLayout } from '@/components/layout/column-layout';
import { StudyNoteTab } from '@/features/studynotes/components/study-note-tab';
import StudyNoteTabShell from '@/features/studynotes/components/study-note-tab-shell';
import { StudyroomSidebar } from '@/features/studyrooms/components/sidebar';
import { useRole } from '@/hooks/use-role';

const StudyNoteLayout = ({ children }: { children: React.ReactNode }) => {
  const { role } = useRole();
  const path = usePathname();
  const params = useParams();
  const studyRoomId = Number(params.id);
  const segment = path.split('/').pop();
  return (
    <ColumnLayout>
      <ColumnLayout.Left className="rounded-[12px] bg-gray-200">
        <StudyroomSidebar studyRoomId={studyRoomId} />
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:max-w-[740px] flex h-[400px] flex-col gap-3 rounded-[12px] px-8">
        <div>
          <StudyNoteTab
            mode={role}
            studyRoomId={studyRoomId}
            path={segment!}
          />
          <div className="border-line-line1 flex flex-col gap-8 rounded-tr-[12px] rounded-b-[12px] border bg-white p-8">
            <StudyNoteTabShell
              mode={role}
              studyRoomId={studyRoomId}
              path={segment!}
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

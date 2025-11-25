import React from 'react';

import { Role } from '@/entities/member';
import { StudyNoteSearch } from '@/features/study-notes/components/study-note-search';

type Props = {
  mode: Role | undefined;
  path: string;
  studyRoomId: number;
};

const StudyNoteTabShell = ({ mode, path, studyRoomId }: Props) => {
  return (
    <>
      {path === 'note' && mode === 'ROLE_TEACHER' && (
        <StudyNoteSearch studyRoomId={studyRoomId} />
      )}
      {path === 'note' && mode === 'ROLE_STUDENT' && (
        <>
          <p className="font-headline1-heading whitespace-pre-wrap">
            {'지난 수업 내용을 확인해볼까요?'}
          </p>
          {/* <div>학생 수업노트 목록 조회 리스트 위치</div> */}
          {/* <StudyNotes
            selectedGroupId="all"
          /> */}
        </>
      )}
      {/*{path === 'qna' && mode === 'ROLE_TEACHER' && (
        <TeacherQuestionSession studyRoomId={studyRoomId} />
      )}
      {path === 'qna' && mode === 'ROLE_STUDENT' && (
        <StudentQuestionSession studyRoomId={studyRoomId} />
      )}*/}
    </>
  );
};

export default StudyNoteTabShell;

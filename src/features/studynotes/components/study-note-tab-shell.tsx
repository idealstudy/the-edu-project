import React from 'react';

import { Role } from '@/features/auth/type';
import { StudyNoteSearch } from '@/features/studynotes/components/study-note-search';

type Props = {
  mode: Role | undefined;
  path: string;
};

const StudyNoteTabShell = ({ mode, path }: Props) => {
  return (
    <>
      {path === 'note' && mode === 'ROLE_TEACHER' && <StudyNoteSearch />}
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

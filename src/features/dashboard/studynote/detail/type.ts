// 스터디 노트 상세
interface StudentInfo {
  studentId: number;
  studentName: string;
}

export interface StudyNoteDetail {
  id: number;
  studyRoomId: number;
  studyRoomName: string;
  groupId?: number;
  title: string;
  content: string;
  resolvedContent?: {
    content: string;
  };
  taughtAt: string;
  visibility:
    | 'PUBLIC'
    | 'PRIVATE'
    | 'TEACHER_ONLY'
    | 'SPECIFIC_STUDENTS_ONLY'
    | 'SPECIFIC_STUDENTS_AND_PARENTS'
    | 'STUDY_ROOM_STUDENTS_ONLY'
    | 'STUDY_ROOM_STUDENTS_AND_PARENTS';
  studentInfos: StudentInfo[];
}

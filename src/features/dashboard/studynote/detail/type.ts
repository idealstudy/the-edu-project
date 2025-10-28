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
  visibility: 'PUBLIC' | 'PRIVATE';
  studentInfos: StudentInfo[];
}

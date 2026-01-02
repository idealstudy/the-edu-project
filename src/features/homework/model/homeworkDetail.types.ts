import type { HomeworkSubmitStatus } from './homework.types';
import type { HomeworkFeedback } from './homeworkFeedback.types';
import type { HomeworkSubmission } from './homeworkSubmission.types';

export interface HomeworkDetail {
  id: number;
  teacherName: string;
  title: string;
  content: string;
  deadline: string;
  modifiedAt: string;
  teachingNoteNameList: string[];
}

export interface HomeworkStudentItem {
  id: number;
  studentName: string;
  status: HomeworkSubmitStatus;
  submission?: HomeworkSubmission;
  feedback?: HomeworkFeedback;
}

export interface TeacherHomeworkDetailData {
  homework: HomeworkDetail;
  homeworkStudents: HomeworkStudentItem[];
}

export interface TeacherHomeworkDetailResponse {
  status: number;
  message: string;
  data: TeacherHomeworkDetailData;
}

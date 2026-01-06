import type { HomeworkSubmitStatus, ReminderOffset } from './homework.types';
import type { HomeworkFeedback } from './homeworkFeedback.types';
import type { HomeworkSubmission } from './homeworkSubmission.types';

export interface HomeworkDetail {
  id: number;
  teacherName: string;
  title: string;
  content: string;
  deadline: string;
  modifiedAt: string;
  reminderOffsets: ReminderOffset[];
  teachingNoteInfoList: {
    id: number;
    name: string;
  }[];
}

// 선생님
// 학생 제출 상세
export interface HomeworkStudentItem {
  id: number;
  studentName: string;
  status: HomeworkSubmitStatus;
  submission?: HomeworkSubmission;
  feedback?: HomeworkFeedback;
}

// 과제 상세 Data / Response
export interface TeacherHomeworkDetailData {
  homework: HomeworkDetail;
  homeworkStudents: HomeworkStudentItem[];
}

export interface TeacherHomeworkDetailResponse {
  status: number;
  message: string;
  data: TeacherHomeworkDetailData;
}

// 학생
// 내 과제 제출
export interface MyHomeworkStudent {
  id: number;
  studentName: string;
  status: HomeworkSubmitStatus;
  submission?: HomeworkSubmission;
  feedback?: HomeworkFeedback;
}

// 다른 학생 제출 요약
export interface OtherHomeworkStudentItem {
  studentName: string;
  status: HomeworkSubmitStatus;
  modifiedSubmissionAt: string | null;
  modifiedFeedbackAt: string | null;
}

// 과제 상세 Data / Response
export interface StudentHomeworkDetailData {
  homework: HomeworkDetail;
  myHomeworkStudent: MyHomeworkStudent;
  otherHomeworkStudents: OtherHomeworkStudentItem[];
}

export interface StudentHomeworkDetailResponse {
  status: number;
  message: string;
  data: StudentHomeworkDetailData;
}

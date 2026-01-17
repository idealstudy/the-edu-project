// 공통
export interface PageableResponse<T> {
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
  content: T[];
}

export type HomeworkSortKey =
  | 'DEADLINE_IMMINENT'
  | 'DEADLINE_RECENT'
  | 'LATEST_EDITED'
  | 'OLDEST_EDITED';

export type HomeworkLimit = 20 | 30;

export type ReminderOffset = 'HOUR_1' | 'HOUR_3' | 'DAY_1';

export type HomeworkSubmitStatus = 'NOT_SUBMIT' | 'SUBMIT' | 'LATE_SUBMIT';

export interface HomeworkPageable {
  page: number;
  size: HomeworkLimit;
  sortKey?: HomeworkSortKey;
  keyword?: string;
}

/* 과제 목록 공통 모델 (목록 UI 전용) */

export interface Homework {
  id: number;
  title: string;
  modDate: string;
  deadline: string;
  deadlineLabel: 'UPCOMING' | 'TODAY' | 'OVERDUE';
  dday: number;
}

// 선생님
export interface TeacherHomeworkItem extends Homework {
  submittedCount: number;
  totalStudentCount: number;
  submittedPercent: number;
}

export interface TeacherHomeworkListResponse {
  status: number;
  message: string;
  data: PageableResponse<TeacherHomeworkItem>;
}

// 과제 생성/수정 요청

export interface TeacherHomeworkRequest {
  title: string;
  content: string;
  deadline: string;
  reminderOffsets?: ReminderOffset[];
  teachingNoteIds?: number[];
  studentIds?: number[];
}

//  학생 과제 목록 아이템

export interface StudentHomeworkItem extends Homework {
  status: HomeworkSubmitStatus;
}

export interface StudentHomeworkListResponse {
  status: number;
  message: string;
  data: PageableResponse<StudentHomeworkItem>;
}

import { dto } from '@/entities/teacher/infrasturcture';
import { z } from 'zod';

export type DashboardTeachingNotesSortKey =
  | 'LATEST_EDITED'
  | 'OLDEST_EDITED'
  | 'TITLE_ASC'
  | 'TAUGHT_AT_ASC';
export type DashboardQnASortKey = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';
export type DashboardMemberSortKey = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';
export type DashboardHomeworkSortKey =
  | 'LATEST'
  | 'LATEST_EDITED'
  | 'OLDEST_EDITED'
  | 'DEADLINE_IMMINENT'
  | 'DEADLINE_RECENT';

export type TeacherReportDTO = z.infer<typeof dto.teacherReport>;
export type TeacherNoteListDTO = z.infer<typeof dto.teacherNoteList>;
export type TeacherStudyRoomListDTO = z.infer<typeof dto.teacherStudyRoomList>;

export type TeacherNoteListItemDTO = TeacherNoteListDTO[number];
export type TeacherStudyRoomListItemDTO = TeacherStudyRoomListDTO[number];

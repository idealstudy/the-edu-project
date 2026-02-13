import { dto } from '../infrasturcture';

const TeacherReportShape = dto.teacherReport;

const TeacherNoteListShape = dto.teacherNoteList;

const TeacherStudyRoomListShape = dto.teacherStudyRoomList;

export const teacherDomain = {
  teacherReport: TeacherReportShape,
  teacherNoteList: TeacherNoteListShape,
  teacherStudyRoomList: TeacherStudyRoomListShape,
};

import { dto } from '../infrasturcture';

const TeacherReportShape = dto.teacherReport;

const TeacherNoteListShape = dto.teacherNoteList;

const TeacherStudyRoomListShape = dto.teacherStudyRoomList;

const TeacherDashboardReportShape = dto.dashboard.report;
const TeacherDashboardNoteListShape = dto.dashboard.noteList;
const TeacherDashboardStudyRoomListShape = dto.dashboard.studyRoomList;
const TeacherDashboardQnaListShape = dto.dashboard.QnaList;
const TeacherDashboardMemberListShape = dto.dashboard.memberList;
const TeacherDashboardHomeworkListShape = dto.dashboard.homeworkList;

export const teacherDomain = {
  teacherReport: TeacherReportShape,
  teacherNoteList: TeacherNoteListShape,
  teacherStudyRoomList: TeacherStudyRoomListShape,
  dashboard: {
    report: TeacherDashboardReportShape,
    noteList: TeacherDashboardNoteListShape,
    studyRoomList: TeacherDashboardStudyRoomListShape,
    QnaList: TeacherDashboardQnaListShape,
    memberList: TeacherDashboardMemberListShape,
    homeworkList: TeacherDashboardHomeworkListShape,
  },
};

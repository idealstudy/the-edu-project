import { dto } from '@/entities/teacher/infrasturcture';
import { z } from 'zod';

export type TeacherReportDTO = z.infer<typeof dto.teacherReport>;
export type TeacherNoteListDTO = z.infer<typeof dto.teacherNoteList>;
export type TeacherStudyRoomListDTO = z.infer<typeof dto.teacherStudyRoomList>;

export type TeacherNoteListItemDTO = TeacherNoteListDTO[number];
export type TeacherStudyRoomListItemDTO = TeacherStudyRoomListDTO[number];

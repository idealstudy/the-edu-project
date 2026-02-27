import { domain } from '@/entities/teacher/core/teacher.domain';
import {
  dto,
  payload,
  query,
} from '@/entities/teacher/infrastructure/teacher.dto';
import { z } from 'zod';

export type TeacherBasicInfoDTO = z.infer<typeof dto.basicInfo>;
export type TeacherReportDTO = z.infer<typeof dto.teacherReport>;
export type TeacherNoteListDTO = z.infer<typeof dto.teacherNoteList>;

export type FrontendTeacherBasicInfo = z.infer<typeof domain.basicInfo>;
export type FrontendTeacherReport = z.infer<typeof domain.teacherReport>;
export type FrontendTeacherNoteListItem = z.infer<
  typeof domain.teacherNoteListItem
>;
export type FrontendTeacherNoteList = z.infer<typeof domain.teacherNoteList>;
export type FrontendTeacherStudyRoomListItem = z.infer<
  typeof domain.teacherStudyRoomListItem
>;
export type FrontendTeacherStudyRoomList = z.infer<
  typeof domain.teacherStudyRoomList
>;
export type FrontendTeacherReviewListItem = z.infer<
  typeof domain.teacherReviewListItem
>;
export type FrontendTeacherReviewList = z.infer<
  typeof domain.teacherReviewList
>;

export type UpdateTeacherBasicInfoPayload = z.infer<
  typeof payload.updateBasicInfo
>;

export type UpdateTeacherTeachingNoteRepresentativePayload = z.infer<
  typeof payload.updateTeachingNoteRepresentative
>;

export type GetTeacherReviewListQuery = z.infer<typeof query.teacherReview>;

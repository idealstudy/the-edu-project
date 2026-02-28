import { GetTeacherReviewListQuery } from '@/entities/teacher/types';

export const teacherKeys = {
  all: ['teacher'] as const,
  report: () => [...teacherKeys.all, 'report'] as const,
  noteList: () => [...teacherKeys.all, 'noteList'] as const,
  studyRoomList: () => [...teacherKeys.all, 'studyRoomList'] as const,
  basicInfo: () => [...teacherKeys.all, 'basicInfo'] as const,
  review: (params: GetTeacherReviewListQuery) =>
    [...teacherKeys.all, 'review', params] as const,
  careers: () => [...teacherKeys.all, 'careers'] as const,
};

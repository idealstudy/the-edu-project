// API 팩토리
import { createTeacherStudyRoomApi } from '@/features/study-rooms/api/room.api.teacher';
import { createStudentStudyRoomApi } from '@/features/study-rooms/api/room.api.student';

// 쿼리옵션
import { createTeacherStudyRoomQueryOptions } from '@/features/study-rooms/api/room.query.options.teacher';
import { createStudentStudyRoomQueryOptions } from '@/features/study-rooms/api/room.query.options.student';
import { createStudyNoteGroupInfiniteOption } from '@/features/study-rooms/api/room.query.options.infinite';

// API 인스턴스
export const teacherStudyRoomApi = createTeacherStudyRoomApi();
export const studentStudyRoomApi = createStudentStudyRoomApi();

// 쿼리 옵션 객체
export const teacherStudyRoomQueryOptions = createTeacherStudyRoomQueryOptions(teacherStudyRoomApi);
export const studentStudyRoomQueryOptions = createStudentStudyRoomQueryOptions(studentStudyRoomApi);

// API 인스턴스에서 노트그룹 메서드 추출
const teacherGroupApi = teacherStudyRoomApi.getStudyNoteGroup;
const studentGroupApi = studentStudyRoomApi.getStudentStudyNoteGroup;

// TODO: 추후 Study Notes Group 엔티티를 분리해서 Study Notes 내부로 옮겨지거나 API 주입 방식으로 전환
export const getStudyNoteGroupInfiniteOption =
  createStudyNoteGroupInfiniteOption(teacherGroupApi, studentGroupApi);

// 파일 전체
export * from './room.api.base';
export * from './room.api.student';
export * from './room.api.teacher';
export * from './room.query.keys';
export * from './room.query.options.student';
export * from './room.query.options.teacher';
export * from './room.query.options.infinite';
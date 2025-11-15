import {
  StudentRoom,
  StudentRoomList,
  TeacherRoom,
  TeacherRoomDetail,
  TeacherRoomList,
} from '../types';
import {
  StudentRoomListItemDTO,
  TeacherRoomDetailDTO,
  TeacherRoomListItemDTO,
} from '../types/room.types';
import { domain } from './room.domain.schema';

/** 선생님 목록용 DTO 하나 → 도메인 Room 하나 */
const fromTeacherListItem = (dto: TeacherRoomListItemDTO): TeacherRoom => {
  return domain.teacher.list.parse(dto);
};

/** 선생님 목록용 DTO 배열 → 도메인 Room 배열 */
const fromTeacherList = (
  dtoList: TeacherRoomListItemDTO[]
): TeacherRoomList => {
  return dtoList.map((dto) => domain.teacher.list.parse(dto));
};

/** 선생님 상세 DTO → 도메인 TeacherRoomDetail */
const fromTeacherDetail = (dto: TeacherRoomDetailDTO): TeacherRoomDetail => {
  return domain.teacher.detail.parse(dto);
};

/** 학생 목록용 DTO 하나 → 도메인 StudentRoom 하나 */
const fromStudentListItem = (dto: StudentRoomListItemDTO): StudentRoom => {
  return domain.student.list.parse(dto);
};

/** 학생 목록용 DTO 배열 → 도메인 StudentRoom 배열 */
const fromStudentList = (
  dtoList: StudentRoomListItemDTO[]
): StudentRoomList => {
  return dtoList.map((dto) => domain.student.list.parse(dto));
};

const teacher = {
  list: fromTeacherList,
  item: fromTeacherListItem,
  detail: fromTeacherDetail,
};

const student = {
  list: fromStudentList,
  item: fromStudentListItem,
};

export const factory = {
  teacher,
  student,
};

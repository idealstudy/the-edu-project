import type { Room, StudentRoom, TeacherRoomDetail } from '../types';
import {
  StudentRoomListItemDTO,
  TeacherRoomDetailDTO,
  TeacherRoomListItemDTO,
} from '../types/room.types';
import {
  RoomDomainSchema,
  StudentRoomDomainSchema,
  TeacherRoomDetailDomainSchema,
} from './room.domain.schema';

export const RoomFactory = {
  /** 선생님 목록용 DTO 하나 → 도메인 Room 하나 */
  fromTeacherListItem(dto: TeacherRoomListItemDTO): Room {
    return RoomDomainSchema.parse(dto);
  },

  /** 선생님 목록용 DTO 배열 → 도메인 Room 배열 */
  fromTeacherList(dtoList: TeacherRoomListItemDTO[]): Room[] {
    return dtoList.map((dto) => RoomDomainSchema.parse(dto));
  },

  /** 선생님 상세 DTO → 도메인 TeacherRoomDetail */
  fromTeacherDetail(dto: TeacherRoomDetailDTO): TeacherRoomDetail {
    return TeacherRoomDetailDomainSchema.parse(dto);
  },

  /** 학생 목록용 DTO 하나 → 도메인 StudentRoom 하나 */
  fromStudentListItem(dto: StudentRoomListItemDTO): StudentRoom {
    return StudentRoomDomainSchema.parse(dto);
  },

  /** 학생 목록용 DTO 배열 → 도메인 StudentRoom 배열 */
  fromStudentList(dtoList: StudentRoomListItemDTO[]): StudentRoom[] {
    return dtoList.map((dto) => StudentRoomDomainSchema.parse(dto));
  },
};

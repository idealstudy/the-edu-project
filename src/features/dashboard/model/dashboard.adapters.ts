import type { MemberDTO } from '@/entities/member';
import type { NoteDomain } from '@/entities/study-note';
import type { RoomsDomain } from '@/entities/study-room';

import { domain } from './dashboard.schema';

type DashboardRole = 'teacher' | 'student';
/**
 * BFF 라우트에서 조합한 멤버 / 스터디룸 / 노트 도메인 데이터를 받아
 * Dashboard 도메인 스키마에 맞게 최종 조립 및 검증하는 어댑터.
 *
 * @param raw.role   대시보드 사용자의 역할(teacher | student)
 * @param raw.member 멤버 도메인으로 변환 가능한 MemberDTO
 * @param raw.rooms  역할에 따라 다른 스터디룸 도메인 리스트(TeacherRoomList | StudentRoomList)
 * @param raw.notes  대시보드에 노출할 노트 도메인 리스트
 * @returns Dashboard 도메인 스키마를 통과한 최종 대시보드 객체
 */
const fromSources = (raw: {
  role: DashboardRole;
  member: MemberDTO;
  rooms: RoomsDomain;
  notes: NoteDomain[];
}): object => {
  return domain.schema.parse({
    member: raw.member,
    rooms: raw.rooms,
    notes: raw.notes,
  });
};

export const adapter = {
  fromSources,
};

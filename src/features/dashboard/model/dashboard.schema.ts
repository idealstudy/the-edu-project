import { member } from '@/entities/member';
import { note } from '@/entities/study-note';
import { room } from '@/entities/study-room';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * BFF에서 프론트로 내려줄 대시보드 전용 멤버 스키마
 * ────────────────────────────────────────────────────*/
const DashboardMemberSchema = member.domain.shape.pick({
  id: true,
  role: true,
  name: true,
});

/* ─────────────────────────────────────────────────────
 * BFF에서 내려줄 최종 Dashboard 응답 형태
 * member: 로그인한 사용자 요약
 * rooms: 최신 스터디룸 n개 (도메인 Room)
 * notes: 최신 노트 n개 (도메인 Note)
 * ────────────────────────────────────────────────────*/
const DashboardSchema = z.object({
  member: DashboardMemberSchema,
  rooms: room.domain.base.array(),
  notes: note.domain.schema.array(),
});

export const domain = {
  schema: DashboardSchema,
  member: DashboardMemberSchema,
};

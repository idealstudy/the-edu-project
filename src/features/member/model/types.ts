import { z } from 'zod';

import { MemberSchema } from './schema';

export type Member = z.infer<typeof MemberSchema>;

export type SessionLike = {
  auth: Member['role'];
  memberId: Member['id'];
  email: Member['email'];
  name?: Member['name'];
  nickname?: Member['nickname'];
};

export const toSessionLike = (m: Member): SessionLike => ({
  auth: m.role,
  memberId: m.id,
  email: m.email,
  name: m.name,
  nickname: m.nickname ?? m.name,
});

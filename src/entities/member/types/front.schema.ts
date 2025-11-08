import { getDisplayName } from '@/entities';
import { z } from 'zod';

import { MemberSchema } from './schema';

export const FrontendMemberSchema = MemberSchema.extend({
  name: z.string().default('사용자'),
  nickname: z.string().default('닉네임'),
}).transform((m) => {
  const displayName = getDisplayName(m, '안녕하세요');
  return { ...m, displayName };
});

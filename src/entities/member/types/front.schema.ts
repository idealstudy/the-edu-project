import { getDisplayName } from '@/entities';
import { z } from 'zod';

import { MemberSchema } from './schema';

const toUndef = (v: unknown) => (v === null ? undefined : v);

export const FrontendMemberSchema = MemberSchema.omit({ password: true })
  .partial()
  .required({ id: true, email: true, role: true })
  .extend({
    name: z.preprocess(toUndef, z.string().default('')),
    nickname: z.preprocess(toUndef, z.string().default('')),
    phoneNumber: z.preprocess(toUndef, z.string().default('')),
    birthDate: z.preprocess(toUndef, z.string().default('')),
    acceptRequiredTerm: z.preprocess(toUndef, z.boolean().default(false)),
    acceptOptionalTerm: z.preprocess(toUndef, z.boolean().default(false)),
    regDate: z.preprocess(toUndef, z.string().default('')),
    modDate: z.preprocess(toUndef, z.string().default('')),
  })
  .transform((m) => ({
    ...m,
    displayName: getDisplayName(
      { email: m.email, name: m.name, nickname: m.nickname },
      '안녕하세요'
    ),
  }));
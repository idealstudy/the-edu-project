import { z } from 'zod';

export const InviteMemberSchema = z.object({
  emails: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().email('올바른 이메일을 입력해주세요.').optional()
  ),
});

export type InviteMemberSchemaType = z.infer<typeof InviteMemberSchema>;

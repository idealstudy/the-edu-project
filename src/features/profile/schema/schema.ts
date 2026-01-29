import { z } from 'zod';

export const ProfileFormSchema = z.object({
  desc: z.string().trim().max(300, '소개는 300자 이내로 작성해주세요.'),
});

export type ProfileUpdateForm = z.infer<typeof ProfileFormSchema>;

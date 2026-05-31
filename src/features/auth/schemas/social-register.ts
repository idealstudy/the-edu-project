import { member } from '@/entities/member';
import { z } from 'zod';

export type SocialRegisterForm = z.infer<typeof SocialRegisterForm>;

export const SocialRegisterForm = z.object({
  role: member.domain.role,
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
});

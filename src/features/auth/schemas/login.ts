import { SessionPayload } from '@/features/auth/types';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export const sessionEnvelope = z
  .object({
    data: SessionPayload.optional(),
    result: SessionPayload.optional(),
  })
  .passthrough();

export type LoginFormValues = z.infer<typeof loginSchema>;

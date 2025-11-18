import { domain, dto } from '@/entities/member';
import { z } from 'zod';

export type MemberDTO = z.infer<typeof dto.schema>;
export type Role = z.infer<typeof dto.role>;
export type FrontendMember = z.infer<typeof domain.schema>;

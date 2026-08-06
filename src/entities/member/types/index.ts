import { domain, dto } from '@/entities/member';
import { FrontendParentBasicInfo } from '@/entities/parent';
import { FrontendStudentBasicInfo } from '@/entities/student';
import { FrontendTeacherBasicInfo } from '@/entities/teacher';
import { z } from 'zod';

export type MemberDTO = z.infer<typeof dto.schema>;
export type Role = z.infer<typeof dto.role>;
export type FrontendMember = z.infer<typeof domain.schema>;
export type AdminMemberListItem = z.infer<typeof dto.adminListItem>;
export type AdminMemberRole = z.infer<typeof dto.adminRole>;
export type AdminMemberDetail = z.infer<typeof dto.adminDetail>;

export type UserBasicInfo =
  | FrontendTeacherBasicInfo
  | FrontendStudentBasicInfo
  | FrontendParentBasicInfo;

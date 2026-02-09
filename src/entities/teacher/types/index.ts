import { domain } from '@/entities/teacher/core/teacher.domain';
import { dto } from '@/entities/teacher/infrastructure/teacher.dto';
import { z } from 'zod';

export type BasicInfoDTO = z.infer<typeof dto.basicInfo>;

export type FrontendBasicInfo = z.infer<typeof domain.basicInfo>;

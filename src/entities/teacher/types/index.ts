import { domain } from '@/entities/teacher/core/teacher.domain';
import { dto, payload } from '@/entities/teacher/infrastructure/teacher.dto';
import { z } from 'zod';

export type BasicInfoDTO = z.infer<typeof dto.basicInfo>;

export type FrontendBasicInfo = z.infer<typeof domain.basicInfo>;

export type UpdateBasicInfoPayload = z.infer<typeof payload.updateBasicInfo>;

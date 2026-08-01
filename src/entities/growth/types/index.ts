import { dto } from '@/entities/growth/infrastructure/growth.dto';
import { z } from 'zod';

export type GrowthState = z.infer<typeof dto.state>;
export type GrowthStage = GrowthState['stage'];

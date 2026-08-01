import {
  dto,
  payload,
} from '@/entities/retrospect/infrastructure/retrospect.dto';
import { z } from 'zod';

export type RetrospectItem = z.infer<typeof dto.item>;
export type TodayRetrospect = z.infer<typeof dto.today>;
export type WeeklyRetrospect = z.infer<typeof dto.weekly>;
export type RetrospectPayload = z.infer<typeof payload.write>;
export type RetrospectMood = NonNullable<RetrospectPayload['mood']>;

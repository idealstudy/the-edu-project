import { sharedSchema } from '@/types';
import { z } from 'zod';

import { base } from '../schema';

/* ─────────────────────────────────────────────────────
 * api 응답(DTO 객체)
 * ────────────────────────────────────────────────────*/
const NotificationDtoSchema = base.schema;

/* ─────────────────────────────────────────────────────
 * api 응답(envelope 포함)
 * ────────────────────────────────────────────────────*/
const NotificationEnvelopeSchema = sharedSchema.response(
  z.array(NotificationDtoSchema)
);

/* ─────────────────────────────────────────────────────
 * 도메인으로 변환(.transform)
 * ────────────────────────────────────────────────────*/
const NotificationAnyResponseSchema = z
  .union([z.array(NotificationDtoSchema), NotificationEnvelopeSchema])
  .nullable()
  .transform((val) => {
    if (val === null) return null;
    return 'data' in val ? val.data : val;
  });

export const dto = {
  schema: NotificationDtoSchema,
  envelope: NotificationEnvelopeSchema,
  response: NotificationAnyResponseSchema,
  category: base.category,
};

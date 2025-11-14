import { z } from 'zod';

import { sharedSchema } from './api.schema';

export type EmptyData = z.infer<typeof sharedSchema.empty>;
export type SuccessId = z.infer<typeof sharedSchema.successId>;

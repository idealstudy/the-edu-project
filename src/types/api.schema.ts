import { z } from 'zod';

export const ApiResponseSchema = <TData extends z.ZodType>(data: TData) =>
  z.object({
    status: z.number(),
    message: z.string().optional(),
    data,
  });

export const EmptyDataSchema = z.object({}).strict();

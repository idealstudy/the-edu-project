import { z } from 'zod';

const ApiResponseSchema = <TData extends z.ZodType>(data: TData) =>
  z.object({
    status: z.number(),
    message: z.string().optional(),
    data,
  });

const EmptyDataSchema = z.object({}).strict();

const SuccessIdSchema = z.number().int();

export const sharedSchema = {
  response: ApiResponseSchema,
  empty: EmptyDataSchema,
  successId: SuccessIdSchema,
};

import { z } from 'zod';

const calendar = z.object({
  date: z.string(),
  todoDone: z.number(),
  todoTotal: z.number(),
  studyMinutes: z.number(),
  hasRetrospect: z.boolean(),
  examCount: z.number(),
});

const retrospect = z.object({
  date: z.string(),
  chips: z.array(z.string()),
  learned: z.string().nullable(),
  reflected: z.string().nullable(),
  tomorrow: z.string().nullable(),
});

export const lookBackDto = z.object({
  coachMessage: z.string().nullable(),
  calendar: z.array(calendar),
  retrospects: z.array(retrospect),
});

export type LookBackPeriod = 'WEEK' | 'MONTH';

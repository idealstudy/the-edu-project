import { z } from 'zod';

const mood = z.enum(['TIRED', 'OKAY', 'FOCUSED']);

const item = z.object({
  id: z.number().int().positive(),
  reflectDate: z.string(),
  content: z.string().nullable(),
  mood: mood.nullable(),
});

const today = z.object({
  date: z.string(),
  written: z.boolean(),
  retrospect: item.nullable(),
});

const weekly = z.object({
  weekOf: z.string(),
  weekEnd: z.string(),
  writtenDays: z.number().int().min(0).max(7),
  aiSummary: z.string().nullable(),
  aiSummaryStatus: z.enum(['READY', 'STUBBED']),
  evidenceTags: z.array(z.string()),
  retrospects: z.array(item),
});

const write = z
  .object({
    content: z.string().trim().max(1000).nullable().optional(),
    mood: mood.nullable().optional(),
  })
  .refine(
    (value) => Boolean(value.mood || value.content?.trim()),
    '컨디션 또는 한 줄 회고를 남겨주세요.'
  );

export const dto = { item, today, weekly };
export const payload = { write };

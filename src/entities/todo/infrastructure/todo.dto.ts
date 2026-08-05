import { z } from 'zod';

const todoStatus = z.enum(['TODO', 'DONE', 'SKIPPED', 'NOT_DONE']);
const todoAssignerRole = z.enum(['SELF', 'TEACHER']);
const todoSource = z.enum([
  'STUDENT',
  'TEACHER',
  'EXAM_HALL',
  'OPEN_CHALLENGE',
]);
const todoApprovalStatus = z.enum(['PENDING', 'APPROVED']);

const todoItem = z.object({
  id: z.number().int().positive(),
  studentId: z.number().int().positive(),
  studentName: z.string().nullable(),
  title: z.string(),
  subject: z.string().nullable(),
  book: z.string().nullable(),
  weekOf: z.string(),
  status: todoStatus,
  skipReason: z.string().nullable(),
  assignerRole: todoAssignerRole,
  assignerId: z.number().int().positive().nullable(),
  source: todoSource,
  rewardPoints: z.number().int().nonnegative(),
  approvalStatus: todoApprovalStatus,
  notDoneReason: z.string().nullable(),
  completedAt: z.string().nullable(),
});

const weekly = z.object({
  weekOf: z.string(),
  weekEnd: z.string(),
  totalCount: z.number().int().nonnegative(),
  doneCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  items: z.array(todoItem),
});

const createTodo = z.object({
  title: z.string().trim().min(1).max(120),
  subject: z.string().trim().max(40).nullable().optional(),
  book: z.string().trim().max(80).nullable().optional(),
  weekOf: z.string().optional(),
});

const updateTodo = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  subject: z.string().trim().max(40).nullable().optional(),
  book: z.string().trim().max(80).nullable().optional(),
  weekOf: z.string().optional(),
  status: todoStatus.optional(),
  skipReason: z.string().trim().max(200).nullable().optional(),
  notDoneReason: z.string().trim().max(300).nullable().optional(),
});

export const dto = {
  item: todoItem,
  weekly,
};

export const payload = {
  create: createTodo,
  update: updateTodo,
};

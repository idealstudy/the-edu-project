import { dto, payload } from '@/entities/todo/infrastructure/todo.dto';
import { z } from 'zod';

export type TodoItem = z.infer<typeof dto.item>;
export type TodoWeekly = z.infer<typeof dto.weekly>;
export type CreateTodoPayload = z.infer<typeof payload.create>;
export type UpdateTodoPayload = z.infer<typeof payload.update>;

import type {
  CreateTodoPayload,
  TodoItem,
  TodoWeekly,
  UpdateTodoPayload,
} from '@/entities/todo/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto, payload } from './todo.dto';

/* ─────────────────────────────────────────────────────
 * [READ] 학생 주간 할 일
 * ────────────────────────────────────────────────────*/
const getWeekly = async (weekOf?: string): Promise<TodoWeekly> => {
  const response = await api.private.get('/student/todos', {
    params: weekOf ? { weekOf } : undefined,
  });
  return unwrapEnvelope(response, dto.weekly);
};

/* ─────────────────────────────────────────────────────
 * [CREATE] 학생 자율 할 일
 * ────────────────────────────────────────────────────*/
const create = async (input: CreateTodoPayload): Promise<TodoItem> => {
  const validated = payload.create.parse(input);
  const response = await api.private.post('/student/todos', validated);
  return unwrapEnvelope(response, dto.item);
};

/* ─────────────────────────────────────────────────────
 * [PATCH] 할 일 내용·상태
 * ────────────────────────────────────────────────────*/
const update = async (
  id: number,
  input: UpdateTodoPayload
): Promise<TodoItem> => {
  const validated = payload.update.parse(input);
  const response = await api.private.patch(`/student/todos/${id}`, validated);
  return unwrapEnvelope(response, dto.item);
};

/* ─────────────────────────────────────────────────────
 * [DELETE] 학생 할 일 soft delete
 * ────────────────────────────────────────────────────*/
const remove = async (id: number): Promise<void> => {
  await api.private.delete(`/student/todos/${id}`);
};

export const repository = {
  getWeekly,
  create,
  update,
  remove,
};

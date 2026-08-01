import type {
  RetrospectItem,
  RetrospectPayload,
  TodayRetrospect,
  WeeklyRetrospect,
} from '@/entities/retrospect/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto, payload } from './retrospect.dto';

const getToday = async (): Promise<TodayRetrospect> => {
  const response = await api.private.get('/student/retrospects/today');
  return unwrapEnvelope(response, dto.today);
};

const getWeekly = async (weekOf?: string): Promise<WeeklyRetrospect> => {
  const response = await api.private.get('/student/retrospects', {
    params: weekOf ? { weekOf } : undefined,
  });
  return unwrapEnvelope(response, dto.weekly);
};

const createToday = async (
  input: RetrospectPayload
): Promise<RetrospectItem> => {
  const validated = payload.write.parse(input);
  const response = await api.private.post('/student/retrospects', validated);
  return unwrapEnvelope(response, dto.item);
};

const updateToday = async (
  input: RetrospectPayload
): Promise<RetrospectItem> => {
  const validated = payload.write.parse(input);
  const response = await api.private.patch(
    '/student/retrospects/today',
    validated
  );
  return unwrapEnvelope(response, dto.item);
};

export const repository = {
  getToday,
  getWeekly,
  createToday,
  updateToday,
};

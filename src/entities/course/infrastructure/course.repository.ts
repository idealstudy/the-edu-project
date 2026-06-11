import {
  type CourseDetail,
  type CourseListItem,
  type CoursePage,
  type EnrollResult,
  type Lesson,
  type ProgressResult,
  type UpdateProgressPayload,
} from '@/entities/course/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { z } from 'zod';

import { domain } from './../core/course.domain';
import { dto, payload } from './course.dto';

/* ─────────────────────────────────────────────────────
 * DTO → Domain 변환
 * ────────────────────────────────────────────────────*/
const toListItem = (raw: unknown): CourseListItem =>
  domain.listItem.parse(dto.listItem.parse(raw));

const toDetail = (raw: unknown): CourseDetail =>
  domain.detail.parse(dto.detail.parse(raw));

const toLesson = (raw: unknown): Lesson =>
  domain.lesson.parse(dto.lesson.parse(raw));

/* ─────────────────────────────────────────────────────
 * 공개 조회
 * ────────────────────────────────────────────────────*/
const getCourses = async (page = 0, size = 10): Promise<CoursePage> => {
  const response = await api.public.get('/public/courses', {
    params: { page, size },
  });
  const parsed = dto.page.parse(unwrapEnvelope(response, z.unknown()));
  return {
    content: parsed.content.map(toListItem),
    hasNext: parsed.hasNext,
  };
};

const getCourse = async (id: number): Promise<CourseDetail> => {
  const response = await api.public.get(`/public/courses/${id}`);
  return toDetail(unwrapEnvelope(response, z.unknown()));
};

/* ─────────────────────────────────────────────────────
 * 수강 (인증)
 * ────────────────────────────────────────────────────*/
const getCourseLessons = async (id: number): Promise<Lesson[]> => {
  const response = await api.private.get(`/common/courses/${id}/lessons`);
  const list = unwrapEnvelope(response, z.array(z.unknown()));
  return list.map(toLesson).sort((a, b) => a.orderIndex - b.orderIndex);
};

const enroll = async (id: number): Promise<EnrollResult> => {
  const response = await api.private.post(`/common/courses/${id}/enroll`);
  const parsed = dto.enrollResult.parse(unwrapEnvelope(response, z.unknown()));
  return domain.enrollResult.parse({
    result: parsed.result,
    orderId: parsed.orderId ?? null,
  });
};

const updateLessonProgress = async (
  lessonId: number,
  body: UpdateProgressPayload
): Promise<ProgressResult> => {
  const validated = payload.updateProgress.parse(body);
  const response = await api.private.post(
    `/common/lessons/${lessonId}/progress`,
    validated
  );
  const parsed = dto.progressResult.parse(
    unwrapEnvelope(response, z.unknown())
  );
  return domain.progressResult.parse({
    ...parsed,
    completedAt: parsed.completedAt ?? null,
  });
};

export const repository = {
  getCourses,
  getCourse,
  getCourseLessons,
  enroll,
  updateLessonProgress,
};

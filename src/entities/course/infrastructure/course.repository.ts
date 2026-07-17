import {
  type CheckpointResult,
  type CourseDetail,
  type CourseListItem,
  type CourseOrderCreateResult,
  type CoursePage,
  type CourseProduct,
  type CreateCourseOrderPayload,
  type EnrollResult,
  type Lesson,
  type LessonSegmentGroup,
  type ProgressResult,
  type SaveWatchPositionPayload,
  type SubmitCheckpointPayload,
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

const toCourseProduct = (raw: unknown): CourseProduct =>
  domain.courseProduct.parse(dto.courseProduct.parse(raw));

const toOrderCreateResult = (raw: unknown): CourseOrderCreateResult =>
  domain.orderCreateResult.parse(dto.orderCreateResult.parse(raw));

const toLessonSegmentGroup = (raw: unknown): LessonSegmentGroup =>
  domain.lessonSegmentGroup.parse(dto.lessonSegmentGroup.parse(raw));

const toCheckpointResult = (raw: unknown): CheckpointResult =>
  domain.checkpointResult.parse(dto.checkpointResult.parse(raw));

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

/* ─────────────────────────────────────────────────────
 * 3티어 상품 (api-contract-v2 ①) — permitAll
 * ────────────────────────────────────────────────────*/
const getCourseProducts = async (
  courseId: number
): Promise<CourseProduct[]> => {
  const response = await api.public.get(
    `/public/courses/${courseId}/products`
  );
  const list = unwrapEnvelope(response, z.array(z.unknown()));
  return list.map(toCourseProduct);
};

/* ─────────────────────────────────────────────────────
 * 주문 생성 (api-contract-v2 ②)
 *  ⛔ 결제 승인(confirm)은 PG 미정(R-A)이라 미구현 — 주문 생성까지만.
 * ────────────────────────────────────────────────────*/
const createCourseOrder = async (
  body: CreateCourseOrderPayload
): Promise<CourseOrderCreateResult> => {
  const validated = payload.createCourseOrder.parse(body);
  const response = await api.private.post('/common/course-orders', validated);
  return toOrderCreateResult(unwrapEnvelope(response, z.unknown()));
};

/* ─────────────────────────────────────────────────────
 * 영상 세그먼트 (api-contract-v2 ⑦⑨⑩)
 * ────────────────────────────────────────────────────*/
const getLessonSegments = async (
  lessonId: number
): Promise<LessonSegmentGroup> => {
  const response = await api.private.get(
    `/common/lessons/${lessonId}/segments`
  );
  return toLessonSegmentGroup(unwrapEnvelope(response, z.unknown()));
};

const submitCheckpoint = async (
  segmentId: number,
  body: SubmitCheckpointPayload
): Promise<CheckpointResult> => {
  const validated = payload.submitCheckpoint.parse(body);
  const response = await api.private.post(
    `/common/segments/${segmentId}/checkpoint`,
    validated
  );
  return toCheckpointResult(unwrapEnvelope(response, z.unknown()));
};

// 이어보기 위치 저장 — 보상·진도 무관(회장 원칙, frd-v2 §4.2). 204 No Content.
const saveWatchPosition = async (
  segmentId: number,
  body: SaveWatchPositionPayload
): Promise<void> => {
  const validated = payload.saveWatchPosition.parse(body);
  await api.private.put(`/common/segments/${segmentId}/watch`, validated);
};

export const repository = {
  getCourses,
  getCourse,
  getCourseLessons,
  enroll,
  updateLessonProgress,
  getCourseProducts,
  createCourseOrder,
  getLessonSegments,
  submitCheckpoint,
  saveWatchPosition,
};

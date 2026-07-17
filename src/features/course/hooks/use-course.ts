'use client';

import { courseKeys, repository } from '@/entities/course';
import {
  type CreateCourseOrderPayload,
  type SaveWatchPositionPayload,
  type SubmitCheckpointPayload,
  type UpdateProgressPayload,
} from '@/entities/course';
import { showBottomToast } from '@/shared/components/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 코스 조회
 * ────────────────────────────────────────────────────*/
export const useCoursesQuery = (page = 0, size = 12) =>
  useQuery({
    queryKey: courseKeys.list(page, size),
    queryFn: () => repository.getCourses(page, size),
  });

export const useCourseDetailQuery = (
  id: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => repository.getCourse(id),
    enabled: (options?.enabled ?? true) && Number.isInteger(id) && id > 0,
  });

export const useCourseLessonsQuery = (
  id: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: courseKeys.lessons(id),
    queryFn: () => repository.getCourseLessons(id),
    enabled: (options?.enabled ?? true) && Number.isInteger(id) && id > 0,
  });

/* ─────────────────────────────────────────────────────
 * 수강 신청 / 진도
 * ────────────────────────────────────────────────────*/
export const useEnrollCourseMutation = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.enroll(courseId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.lessons(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(courseId),
      });
      if (result.result === 'ENROLLED') {
        showBottomToast('수강 신청이 완료됐어요. 모든 차시가 열렸어요.');
      } else {
        showBottomToast('결제 후 수강이 시작돼요.');
      }
    },
    onError: () => {
      showBottomToast('수강 신청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    },
  });
};

export const useUpdateLessonProgressMutation = (courseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      payload,
    }: {
      lessonId: number;
      payload: UpdateProgressPayload;
    }) => repository.updateLessonProgress(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.lessons(courseId),
      });
    },
  });
};

/* ─────────────────────────────────────────────────────
 * 3티어 상품 · 주문 생성
 *  ⛔ confirm(실결제 승인)은 PG 미정(R-A)이라 미구현 — 주문 생성까지.
 * ────────────────────────────────────────────────────*/
export const useCourseProductsQuery = (
  courseId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: courseKeys.products(courseId),
    queryFn: () => repository.getCourseProducts(courseId),
    enabled:
      (options?.enabled ?? true) && Number.isInteger(courseId) && courseId > 0,
  });

export const useCreateCourseOrderMutation = () =>
  useMutation({
    mutationFn: (body: CreateCourseOrderPayload) =>
      repository.createCourseOrder(body),
    onError: () => {
      showBottomToast('주문 생성에 실패했어요. 잠시 후 다시 시도해 주세요.');
    },
  });

/* ─────────────────────────────────────────────────────
 * 영상 세그먼트 · 체크포인트
 *  보상은 시청이 아니라 체크포인트 능동 행위에만 걸린다(회장 원칙).
 * ────────────────────────────────────────────────────*/
export const useLessonSegmentsQuery = (
  lessonId: number | null,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: courseKeys.segments(lessonId ?? 0),
    queryFn: () => repository.getLessonSegments(lessonId as number),
    enabled:
      (options?.enabled ?? true) &&
      lessonId != null &&
      Number.isInteger(lessonId) &&
      lessonId > 0,
  });

export const useSubmitCheckpointMutation = (lessonId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      segmentId,
      payload,
    }: {
      segmentId: number;
      payload: SubmitCheckpointPayload;
    }) => repository.submitCheckpoint(segmentId, payload),
    onSuccess: (result) => {
      if (lessonId != null) {
        queryClient.invalidateQueries({
          queryKey: courseKeys.segments(lessonId),
        });
      }
      if (result.allSegmentsCleared) {
        showBottomToast('전 세그먼트 클리어! 개념노트 슬롯이 열렸어요.');
      }
    },
  });
};

// 이어보기 위치 저장 — 실패해도 학습 흐름을 막지 않는다(보상·진도 무관).
export const useSaveWatchPositionMutation = () =>
  useMutation({
    mutationFn: ({
      segmentId,
      payload,
    }: {
      segmentId: number;
      payload: SaveWatchPositionPayload;
    }) => repository.saveWatchPosition(segmentId, payload),
  });

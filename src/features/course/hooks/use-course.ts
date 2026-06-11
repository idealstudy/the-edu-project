'use client';

import { courseKeys, repository } from '@/entities/course';
import { type UpdateProgressPayload } from '@/entities/course';
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

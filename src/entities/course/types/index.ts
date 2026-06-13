import { domain } from '@/entities/course/core';
import { payload } from '@/entities/course/infrastructure/course.dto';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Frontend Type — 코스
 * ────────────────────────────────────────────────────*/
export type ProgressStatus = z.infer<typeof domain.progressStatus>;
export type CourseListItem = z.infer<typeof domain.listItem>;
export type CourseDetail = z.infer<typeof domain.detail>;
export type Lesson = z.infer<typeof domain.lesson>;
export type LessonProblem = z.infer<typeof domain.lessonProblem>;
export type EnrollResult = z.infer<typeof domain.enrollResult>;
export type ProgressResult = z.infer<typeof domain.progressResult>;

export type CoursePage = {
  content: CourseListItem[];
  hasNext: boolean;
};

/* ─────────────────────────────────────────────────────
 * Payload Type
 * ────────────────────────────────────────────────────*/
export type UpdateProgressPayload = z.infer<typeof payload.updateProgress>;

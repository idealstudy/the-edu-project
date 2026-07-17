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

export type PlanType = z.infer<typeof domain.planType>;
export type CourseProduct = z.infer<typeof domain.courseProduct>;
export type CourseOrderCreateResult = z.infer<typeof domain.orderCreateResult>;
export type DayType = z.infer<typeof domain.dayType>;
export type LessonSegment = z.infer<typeof domain.lessonSegment>;
export type LessonSegmentGroup = z.infer<typeof domain.lessonSegmentGroup>;
export type PlaybackTicket = z.infer<typeof domain.playbackTicket>;
export type CheckpointResult = z.infer<typeof domain.checkpointResult>;

/* ─────────────────────────────────────────────────────
 * Payload Type
 * ────────────────────────────────────────────────────*/
export type UpdateProgressPayload = z.infer<typeof payload.updateProgress>;
export type CreateCourseOrderPayload = z.infer<
  typeof payload.createCourseOrder
>;
export type SubmitCheckpointPayload = z.infer<
  typeof payload.submitCheckpoint
>;
export type SaveWatchPositionPayload = z.infer<
  typeof payload.saveWatchPosition
>;

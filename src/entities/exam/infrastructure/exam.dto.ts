import { z } from 'zod';

const examType = z.enum(['NATIONAL', 'SCHOOL']);
const attemptStatus = z.enum([
  'ASSIGNED',
  'IN_PROGRESS',
  'SUBMITTED',
  'ANALYZED',
]);

const assignedExam = z.object({
  examId: z.number().int().positive(),
  attemptId: z.number().int().positive(),
  title: z.string(),
  subject: z.string(),
  examType,
  status: attemptStatus,
  totalQuestions: z.number().int().positive(),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
  predictedGradeLow: z.number().int().min(1).max(9).nullable(),
  predictedGradeHigh: z.number().int().min(1).max(9).nullable(),
});

const examQuestion = z.object({
  questionNo: z.number().int().positive(),
  prompt: z.string(),
  treeNodeId: z.number().int().positive().nullable(),
});

const attemptSheet = z.object({
  attemptId: z.number().int().positive(),
  title: z.string(),
  examType,
  totalQuestions: z.number().int().positive(),
  questions: z.array(examQuestion),
  status: attemptStatus,
});

const predictionEvidence = z.object({
  source: z.enum(['EXAM_SCORE', 'WRONG_ANSWER_REVIEW', 'WEAKNESS_TREE']),
  label: z.string(),
  value: z.number(),
});

const weakUnit = z.object({
  treeNodeId: z.number().int().positive(),
  name: z.string(),
  wrongCount: z.number().int().nonnegative(),
});

const teacherPin = z.object({
  id: z.number().int().positive(),
  attemptId: z.number().int().positive(),
  treeNodeId: z.number().int().positive().nullable(),
  teacherId: z.number().int().positive(),
  teacherName: z.string(),
  comment: z.string(),
  createdAt: z.string(),
  acknowledgedAt: z.string().nullable(),
  acknowledged: z.boolean(),
});

const analysis = z.object({
  attemptId: z.number().int().positive(),
  examTitle: z.string(),
  examType,
  rawScore: z.number().min(0).max(100),
  predictedGradeLow: z.number().int().min(1).max(9),
  predictedGradeHigh: z.number().int().min(1).max(9),
  weakUnits: z.array(weakUnit),
  evidence: z.array(predictionEvidence),
  teacherPins: z.array(teacherPin),
  estimateSource: z.enum(['AI_STUB', 'EBSI_REAL']),
  realDataLinked: z.boolean(),
  referenceOnly: z.boolean(),
  realDataFollowUpRequired: z.boolean(),
  dataNotice: z.string(),
});

const teacherExam = z.object({
  examId: z.number().int().positive(),
  title: z.string(),
  subject: z.string(),
  examType,
  totalQuestions: z.number().int().positive(),
});

const parentSummary = z.object({
  childId: z.number().int().positive(),
  childName: z.string(),
  predictedGradeLow: z.number().int().min(1).max(9).nullable(),
  predictedGradeHigh: z.number().int().min(1).max(9).nullable(),
  reassuranceSummary: z.string(),
  estimate: z.boolean(),
  notice: z.string(),
});

const createQuestion = z.object({
  questionNo: z.number().int().positive(),
  correctAnswer: z.string().min(1),
  treeNodeId: z.number().int().positive().nullable(),
  prompt: z.string().min(1),
});

const createExam = z.object({
  title: z.string().min(1).max(120),
  sourcePdfMediaId: z.string().min(1),
  subject: z.enum([
    'KOREAN',
    'ENGLISH',
    'MATH',
    'SCIENCE',
    'SOCIETY',
    'ART_PE',
    'ESSAY',
    'OTHER',
  ]),
  examType,
  questions: z.array(createQuestion).min(1),
});

const assignExam = z.object({
  studyRoomId: z.number().int().positive(),
  excludedStudentIds: z.array(z.number().int().positive()).default([]),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
});

const submitAnswer = z.object({
  questionNo: z.number().int().positive(),
  selectedAnswer: z.string().min(1),
  timeSpentSec: z.number().int().nonnegative(),
});

const submitAttempt = z.object({ answers: z.array(submitAnswer).min(1) });
const createPin = z.object({
  treeNodeId: z.number().int().positive().nullable().optional(),
  comment: z.string().trim().min(1).max(500),
});

export const dto = {
  assignedExamList: z.array(assignedExam),
  attemptSheet,
  analysis,
  teacherExamList: z.array(teacherExam),
  parentSummary,
  created: z.object({ examId: z.number().int().positive() }),
  assigned: z.object({
    examId: z.number().int().positive(),
    assignedStudentCount: z.number().int().nonnegative(),
  }),
  teacherPin,
  teacherPins: z.array(teacherPin),
};

export const payload = {
  create: createExam,
  assign: assignExam,
  submit: submitAttempt,
  createPin,
};

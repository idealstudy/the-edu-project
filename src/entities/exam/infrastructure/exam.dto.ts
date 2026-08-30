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
  questions: z.array(examQuestion).min(1),
  status: attemptStatus,
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
  evidence: z.array(
    z.object({ source: z.string(), label: z.string(), value: z.number() })
  ),
  teacherPins: z.array(teacherPin),
  estimateSource: z.enum(['AI_STUB', 'EBSI_REAL']),
  realDataLinked: z.boolean(),
  referenceOnly: z.boolean(),
  realDataFollowUpRequired: z.boolean(),
  dataNotice: z.string(),
  gradeBasis: z.enum(['MEASURED', 'PREDICTED']),
  standardScore: z.number().int().nullable(),
  confidence: z.enum(['높음', '보통', '낮음']),
  adjustmentReason: z.string().nullable(),
  totalQuestions: z.number().int().positive(),
  answerResults: z.array(
    z.object({ questionNo: z.number().int().positive(), correct: z.boolean() })
  ),
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
  correctAnswer: z.string().min(1).optional(),
  treeNodeId: z.number().int().positive().nullable().optional(),
  prompt: z.string().min(1).optional(),
  challengeId: z.number().int().positive().optional(),
});

const createExam = z.object({
  title: z.string().min(1).max(120),
  sourcePdfMediaId: z.string().min(1).optional(),
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
  examTreeNodeIds: z.array(z.number().int().positive()).default([]),
});

const assignExam = z
  .object({
    studyRoomId: z.number().int().positive().optional(),
    excludedStudentIds: z.array(z.number().int().positive()).default([]),
    studentIds: z.array(z.number().int().positive()).default([]),
    periodStart: z.string().nullable(),
    periodEnd: z.string().nullable(),
  })
  .refine(
    (value) => Boolean(value.studyRoomId) !== value.studentIds.length > 0,
    '수업 또는 학생 개인 중 한 가지 배정 대상만 선택해주세요.'
  );

const questionBankItem = z.object({
  challengeId: z.number().int().positive(),
  questionNo: z.number().int().positive().nullable(),
  title: z.string(),
  sourceText: z.string(),
  questionText: z.string().nullable(),
  questionImageUrl: z.string().nullable(),
  difficulty: z.enum(['LOW', 'MID', 'HIGH', 'TOP']),
  wrongAnswerRate: z.number().nullable(),
  treeNodeId: z.number().int().positive().nullable(),
  treeNodePath: z.string(),
  hasCorrectAnswer: z.boolean(),
  hasCutoff: z.boolean(),
});

const questionBank = z.object({
  content: z.array(questionBankItem),
  totalElements: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
});

const examHallAssigned = z.object({
  examId: z.number().int().positive(),
  attemptId: z.number().int().positive(),
  title: z.string(),
  badge: z.literal('우리 반'),
  periodEnd: z.string().nullable(),
  status: attemptStatus,
  questionCount: z.number().int().positive(),
});

const examHall = z.object({
  assigned: z.array(examHallAssigned),
  public: z.array(
    z.object({
      examId: z.number().int().positive(),
      title: z.string(),
      badge: z.literal('공개'),
      questionCount: z.number().int().positive(),
      hasCutoff: z.boolean(),
    })
  ),
});

/** 공개 시험 응시 시작 응답 (POST /student/exam-hall/{examId}/attempts) */
const publicExamAttempt = z.object({
  attemptId: z.number().int().positive(),
  examId: z.number().int().positive(),
  title: z.string(),
  alreadyStarted: z.boolean(),
});

const gradeCutoff = z.object({
  examId: z.number().int().positive(),
  source: z.string().min(1),
  fullScore: z.number().positive(),
  mean: z.number().nullable(),
  stdDev: z.number().nullable(),
  cutoffs: z.array(
    z.object({ grade: z.number().int().min(1).max(8), minRawScore: z.number() })
  ),
  gradeBasis: z.literal('MEASURED'),
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
  created: z.object({
    examId: z.number().int().positive(),
    totalQuestions: z.number().int().positive(),
    resolvedFromBank: z.number().int().nonnegative(),
    typedByTeacher: z.number().int().nonnegative(),
    overriddenByBank: z.number().int().nonnegative(),
    questionsWithoutUnit: z.number().int().nonnegative(),
    gradeBasis: z.enum(['MEASURED', 'PREDICTED']),
  }),
  assigned: z.object({
    examId: z.number().int().positive(),
    assignedStudentCount: z.number().int().nonnegative(),
    skippedStudentCount: z.number().int().nonnegative(),
  }),
  teacherPin,
  teacherPins: z.array(teacherPin),
  questionBank,
  questionBankItem,
  examHall,
  publicExamAttempt,
  gradeCutoff,
};

const questionBankParams = z.object({
  subject: z
    .enum([
      'KOREAN',
      'ENGLISH',
      'MATH',
      'SCIENCE',
      'SOCIETY',
      'ART_PE',
      'ESSAY',
      'OTHER',
    ])
    .optional(),
  grade: z.enum(['HIGH_1', 'HIGH_2']).optional(),
  treeNodeIds: z.array(z.number().int().positive()).default([]),
  difficulty: z.enum(['LOW', 'MID', 'HIGH']).optional(),
  excludeChallengeIds: z.array(z.number().int().positive()).default([]),
  page: z.number().int().nonnegative().default(0),
  size: z.number().int().min(1).max(50).default(20),
});

const gradeCutoffPayload = z.object({
  source: z.string().trim().min(1).max(200),
  fullScore: z.number().positive(),
  mean: z.number().nonnegative().optional(),
  stdDev: z.number().positive().optional(),
  cutoffs: z
    .array(
      z.object({
        grade: z.number().int().min(1).max(8),
        minRawScore: z.number().nonnegative(),
      })
    )
    .length(8),
});

export const payload = {
  create: createExam,
  assign: assignExam,
  submit: submitAttempt,
  createPin,
  questionBankParams,
  gradeCutoff: gradeCutoffPayload,
};

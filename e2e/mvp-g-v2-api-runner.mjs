// MVP-G v2 API QA runner. Real dev accounts and data only. No route mocks.
// Evidence is sanitized before it is written. Credentials and cookies are never logged.
import { writeFileSync } from 'node:fs';

const API_BASE = process.env.E2E_API_BASE_URL ?? 'https://apidev.d-edu.site';
const WEB_BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const EVIDENCE_PATH =
  process.env.MVPG_API_EVIDENCE_PATH ?? '/tmp/mvpg-v30-api-evidence.json';
const runId = `QA-MVPG-V30-${Date.now()}`;
const evidence = [];
const checks = [];
const cookies = new Map();

const credentials = {
  student: requiredCredential('E2E_STUDENT_EMAIL', 'E2E_STUDENT_PASSWORD'),
  student2: requiredCredential('E2E_STUDENT2_EMAIL', 'E2E_STUDENT2_PASSWORD'),
  teacher: requiredCredential('E2E_TEACHER_EMAIL', 'E2E_TEACHER_PASSWORD'),
  admin: requiredCredential('E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD'),
};

function requiredCredential(emailName, passwordName) {
  const email = process.env[emailName];
  const password = process.env[passwordName];
  if (!email || !password) {
    throw new Error(`Required credential variables are missing: ${emailName}`);
  }
  return { email, password };
}

function sanitize(value, key = '') {
  if (value == null) return value;
  if (
    /password|authorization|refresh|cookie|token|email|contact|receiptNo|uploadUrl|headers/i.test(
      key
    )
  ) {
    return '[REDACTED]';
  }
  if (/^(name|teacherName|studentName)$/i.test(key)) return '[REDACTED_PII]';
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitize(childValue, childKey),
      ])
    );
  }
  if (typeof value === 'string' && value.length > 1000) {
    return `${value.slice(0, 1000)}...[TRUNCATED]`;
  }
  return value;
}

function recordCheck(id, pass, detail, observed = null) {
  checks.push({ id, status: pass ? 'PASS' : 'FAIL', detail, observed });
  return pass;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function responseData(body) {
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  return body;
}

function setCookiesFrom(response, role) {
  const raw =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean);
  const pairs = raw
    .flatMap((header) => header.split(/,(?=[^;,]+=)/))
    .map((header) => header.split(';', 1)[0])
    .filter((pair) => pair && !pair.endsWith('='));
  cookies.set(role, pairs.join('; '));
}

async function request({
  role,
  method = 'GET',
  endpoint,
  body,
  label,
  base = API_BASE,
  capture = true,
}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (role && cookies.has(role)) headers.Cookie = cookies.get(role);
  const response = await fetch(`${base}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  });
  const parsed = await parseResponse(response);
  evidence.push({
    label,
    role: role ?? 'anonymous',
    method,
    endpoint,
    httpStatus: response.status,
    request: sanitize(body ?? null),
    response: capture
      ? sanitize(parsed)
      : { type: Array.isArray(responseData(parsed)) ? 'array' : typeof parsed },
  });
  return { status: response.status, body: parsed, data: responseData(parsed) };
}

async function login(role) {
  const result = await request({
    method: 'POST',
    endpoint: '/api/auth/login',
    body: credentials[role],
    label: `login-${role}`,
  });
  recordCheck(
    `AUTH-${role.toUpperCase()}`,
    result.status === 200,
    '실계정 로그인',
    {
      httpStatus: result.status,
    }
  );
  if (result.status !== 200) return;
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials[role]),
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  });
  await response.arrayBuffer();
  setCookiesFrom(response, role);
  recordCheck(
    `AUTH-${role.toUpperCase()}-COOKIE`,
    Boolean(cookies.get(role)?.includes('Authorization=')),
    'Authorization 쿠키 획득'
  );
}

async function expectStatus(id, options, expected) {
  const result = await request(options);
  recordCheck(id, expected.includes(result.status), options.label, {
    httpStatus: result.status,
    response: sanitize(result.body),
  });
  return result;
}

async function createRoomAndInvite() {
  const roomTitle = `${runId}-ROOM`;
  const created = await request({
    role: 'teacher',
    method: 'POST',
    endpoint: '/api/teacher/study-rooms',
    label: 'create-qa-study-room',
    body: {
      name: roomTitle,
      description: 'MVP-G v2.1 API QA 전용 수업',
      characteristic: '<p>API QA evidence room</p>',
      modality: 'ONLINE',
      classForm: 'ONE_ON_ONE',
      subjectType: 'MATH',
      schoolInfo: { schoolLevel: 'OTHER' },
      visibility: 'PRIVATE',
      mediaIds: [],
    },
  });
  const roomId = created.data?.id;
  recordCheck(
    'SEED-ROOM',
    created.status === 200 && Number.isFinite(roomId),
    'QA 수업 생성',
    {
      httpStatus: created.status,
      roomId,
    }
  );
  if (!roomId) return null;

  const invited = await request({
    role: 'teacher',
    method: 'POST',
    endpoint: `/api/teacher/study-rooms/${roomId}/members`,
    label: 'invite-student-to-qa-room',
    body: { studentEmailList: [credentials.student.email] },
  });
  recordCheck(
    'RG4-INVITE',
    invited.status === 200 && invited.data?.successEmailList?.length === 1,
    '선생님 발행 초대와 자동 승인',
    {
      httpStatus: invited.status,
      successCount: invited.data?.successEmailList?.length ?? 0,
      failCount: invited.data?.failEmailList?.length ?? 0,
    }
  );

  const studentRooms = await request({
    role: 'student',
    endpoint: '/api/student/study-rooms',
    label: 'student-room-membership-after-invite',
  });
  const connected = studentRooms.data?.find((room) => room.id === roomId);
  recordCheck(
    'RG5-STUDYROOM',
    studentRooms.status === 200 && connected?.state === 'APPROVED',
    '학생 수업 목록에 승인 상태 반영',
    { httpStatus: studentRooms.status, state: connected?.state ?? null }
  );
  return { roomId, roomTitle };
}

async function createExam({
  title,
  questions,
  examTreeNodeIds = [],
  sourcePdfMediaId,
}) {
  return request({
    role: 'teacher',
    method: 'POST',
    endpoint: '/api/teacher/exams',
    label: `create-exam-${title}`,
    body: {
      title,
      sourcePdfMediaId,
      subject: 'MATH',
      examType: 'NATIONAL',
      examTreeNodeIds,
      questions,
    },
  });
}

async function assignExam(examId, roomId, label) {
  return request({
    role: 'teacher',
    method: 'POST',
    endpoint: `/api/teacher/exams/${examId}/assignments`,
    label,
    body: {
      studyRoomId: roomId,
      excludedStudentIds: [],
      studentIds: [],
      periodStart: new Date().toISOString(),
      periodEnd: null,
    },
  });
}

async function findCorrectAnswer(challengeId, index) {
  const detail = await request({
    endpoint: `/api/public/challenges/${challengeId}`,
    label: `r1-answer-probe-${index}-detail`,
  });
  for (const choice of detail.data?.choices ?? []) {
    const graded = await request({
      method: 'POST',
      endpoint: `/api/public/challenges/${challengeId}/grade`,
      label: `r1-answer-probe-${index}-grade`,
      body: {
        selectedAnswer: choice,
        timeSpentSeconds: 1,
        drawingImageMediaId: null,
      },
    });
    if (graded.status === 200 && graded.data?.correct === true) return choice;
  }
  return null;
}

async function createQaPdfMedia(boundaryGrade) {
  const presigned = await request({
    role: 'teacher',
    method: 'POST',
    endpoint: '/api/common/media/presign-batch',
    label: `grade-${boundaryGrade}-pdf-presign`,
    body: {
      mediaAssetList: [
        {
          fileName: `${runId}-grade-${boundaryGrade}.pdf`,
          contentType: 'application/pdf',
          sizeBytes: 8,
          targetType: 'EXAM_PDF',
        },
      ],
    },
  });
  const asset = presigned.data?.mediaAssetList?.[0];
  if (!asset?.uploadUrl || !asset?.mediaId) return null;
  const uploaded = await fetch(asset.uploadUrl, {
    method: 'PUT',
    headers: { ...(asset.headers ?? {}), 'Content-Type': 'application/pdf' },
    body: Buffer.from('%PDF-QA1'),
    signal: AbortSignal.timeout(30_000),
  });
  await uploaded.arrayBuffer();
  evidence.push({
    label: `grade-${boundaryGrade}-pdf-upload`,
    role: 'teacher',
    method: 'PUT',
    endpoint: '[REDACTED_SIGNED_URL]',
    httpStatus: uploaded.status,
    request: { bytes: 8, contentType: 'application/pdf' },
    response: null,
  });
  return uploaded.status === 200 ? asset.mediaId : null;
}

async function runR1(roomId) {
  const roomsBefore = await request({
    role: 'teacher',
    endpoint: '/api/teacher/dashboard/study-rooms',
    label: 'r1-teacher-rooms-before',
  });
  const roomRowsBefore = (roomsBefore.data ?? []).filter(
    (row) => row.id === roomId
  );
  recordCheck(
    'R1-T1',
    roomsBefore.status === 200 && roomRowsBefore.length >= 1,
    '생성한 수업이 시험 배정 대상에 존재',
    { matchingRows: roomRowsBefore.length }
  );

  const bank = await request({
    role: 'teacher',
    endpoint:
      '/api/teacher/question-bank?subject=MATH&difficulty=MID&page=0&size=10',
    label: 'r1-question-bank',
  });
  const bankItems = bank.data?.content ?? [];
  const nodeIds = [
    ...new Set(bankItems.map((item) => item.treeNodeId).filter(Boolean)),
  ];
  recordCheck(
    'R1-T2',
    bank.status === 200 && bankItems.length === 10 && nodeIds.length > 0,
    '문제은행 중 난이도 10문항과 단원 연결',
    { questionCount: bankItems.length, nodeCount: nodeIds.length }
  );

  const treeBefore = await request({
    role: 'student',
    endpoint: '/api/common/tree',
    label: 'r1-tree-before',
  });
  const treeBeforeMap = new Map(
    (treeBefore.data?.nodes ?? []).map((node) => [node.nodeId, node])
  );
  const wrongBefore = await request({
    role: 'student',
    endpoint: '/api/student/wrong-answers?page=0&size=200',
    label: 'r1-wrong-answers-before',
  });
  const wrongBeforeIds = new Set(
    (wrongBefore.data?.items ?? []).map((item) => item.id)
  );
  const inboxBefore = await request({
    role: 'teacher',
    endpoint: '/api/teacher/inbox',
    label: 'r1-teacher-inbox-before',
  });

  const examTitle = `${runId}-R1`;
  const created = await createExam({
    title: examTitle,
    examTreeNodeIds: nodeIds,
    questions: bankItems.map((item, index) => ({
      questionNo: index + 1,
      challengeId: item.challengeId,
    })),
  });
  const examId = created.data?.examId;
  recordCheck(
    'R1-T2-CREATE',
    created.status === 200 &&
      created.data?.resolvedFromBank === 10 &&
      created.data?.typedByTeacher === 0,
    '정답 타이핑 없이 문제은행 10문항 시험 생성',
    sanitize(created.data)
  );
  if (!examId) return null;

  const assigned = await assignExam(examId, roomId, 'r1-assign-exam');
  recordCheck(
    'R1-T5',
    assigned.status === 200 && assigned.data?.assignedStudentCount >= 1,
    '수업 학생에게 시험 배정',
    sanitize(assigned.data)
  );

  const hall = await request({
    role: 'student',
    endpoint: '/api/student/exam-hall',
    label: 'r1-student-exam-hall',
  });
  const hallItem = hall.data?.assigned?.find((item) => item.examId === examId);
  recordCheck(
    'R1-T6',
    hall.status === 200 &&
      hallItem?.badge === '우리 반' &&
      hallItem?.questionCount === 10,
    '학생 응시장에 우리 반 시험 10문항 표시',
    sanitize(hallItem)
  );
  const attemptId = hallItem?.attemptId;
  if (!attemptId) return null;

  const sheet = await request({
    role: 'student',
    endpoint: `/api/student/exams/${attemptId}`,
    label: 'r1-attempt-sheet',
  });
  const leakedAnswer = JSON.stringify(sheet.data ?? {}).includes(
    'correctAnswer'
  );
  recordCheck(
    'R1-T7-SHEET',
    sheet.status === 200 &&
      sheet.data?.title === examTitle &&
      sheet.data?.questions?.length === 10 &&
      !leakedAnswer,
    '응시 문항 10개와 정답 비노출',
    {
      runIdMatched: sheet.data?.title === examTitle,
      questionCount: sheet.data?.questions?.length ?? 0,
      leakedAnswer,
    }
  );

  const probedAnswers = [];
  for (let index = 0; index < bankItems.length; index += 1) {
    probedAnswers.push(
      await findCorrectAnswer(bankItems[index].challengeId, index)
    );
  }
  const answers = probedAnswers.map((correctAnswer, index) => ({
    questionNo: index + 1,
    selectedAnswer: index < 5 && correctAnswer ? correctAnswer : '999',
    timeSpentSec: 1,
  }));
  const submitted = await request({
    role: 'student',
    method: 'POST',
    endpoint: `/api/student/exams/${attemptId}/submit`,
    label: 'r1-submit-exam',
    body: { answers },
  });
  const wrongCount = (submitted.data?.answerResults ?? []).filter(
    (item) => !item.correct
  ).length;
  const ownRunAttemptCount = submitted.data?.answerResults?.length ?? 0;
  recordCheck(
    'R1-T7',
    submitted.status === 200 &&
      submitted.data?.answerResults?.length === 10 &&
      wrongCount > 0,
    '제출 즉시 10문항 채점 결과',
    {
      httpStatus: submitted.status,
      rawScore: submitted.data?.rawScore,
      resultCount: submitted.data?.answerResults?.length ?? 0,
      wrongCount,
    }
  );

  const duplicate = await request({
    role: 'student',
    method: 'POST',
    endpoint: `/api/student/exams/${attemptId}/submit`,
    label: 'edge-duplicate-exam-submit',
    body: { answers },
  });
  recordCheck(
    'EDGE-DUPLICATE-SUBMIT',
    duplicate.status >= 400 && duplicate.status < 500,
    '동일 시험 중복 제출 거부',
    { httpStatus: duplicate.status, response: sanitize(duplicate.body) }
  );

  const treeAfter = await request({
    role: 'student',
    endpoint: '/api/common/tree',
    label: 'r1-tree-after',
  });
  const treeAfterMap = new Map(
    (treeAfter.data?.nodes ?? []).map((node) => [node.nodeId, node])
  );
  const attemptDelta = nodeIds.reduce(
    (sum, nodeId) =>
      sum +
      ((treeAfterMap.get(nodeId)?.attemptCount ?? 0) -
        (treeBeforeMap.get(nodeId)?.attemptCount ?? 0)),
    0
  );
  const masteryChanged = nodeIds.some(
    (nodeId) =>
      treeAfterMap.get(nodeId)?.masteryScore !==
      treeBeforeMap.get(nodeId)?.masteryScore
  );
  recordCheck(
    'R1-T8',
    sheet.data?.title === examTitle &&
      ownRunAttemptCount === 10 &&
      attemptDelta >= ownRunAttemptCount &&
      masteryChanged,
    '자기 runId 제출 10문항과 약점 트리 숙련도 실변화',
    {
      runIdMatched: sheet.data?.title === examTitle,
      ownRunAttemptCount,
      globalAttemptDelta: attemptDelta,
      masteryChanged,
    }
  );

  const wrongAfter = await request({
    role: 'student',
    endpoint: '/api/student/wrong-answers?page=0&size=200',
    label: 'r1-wrong-answers-after',
  });
  const newExamWrongs = (wrongAfter.data?.items ?? []).filter(
    (item) =>
      item.sourceType === 'EXAM' &&
      item.questionSnapshot?.sourceText === examTitle &&
      !wrongBeforeIds.has(item.id)
  );
  recordCheck(
    'R1-T10',
    wrongAfter.status === 200 && newExamWrongs.length === wrongCount,
    '틀린 문항 수와 신규 시험 오답 수 일치',
    {
      runId: examTitle,
      wrongCount,
      newExamWrongCount: newExamWrongs.length,
    }
  );

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const daily = await request({
    role: 'student',
    endpoint: `/api/student/daily-problems?date=${tomorrow}`,
    label: 'r1-next-day-daily-problems',
  });
  const dailyWrongIds = new Set(
    (daily.data?.items ?? []).map((item) => item.wrongAnswerId)
  );
  recordCheck(
    'R1-T11',
    daily.status === 200 &&
      newExamWrongs.some((item) => dailyWrongIds.has(item.id)),
    '다음날 오늘의 문제에 이번 시험 오답 포함',
    {
      queueDate: daily.data?.queueDate,
      itemCount: daily.data?.items?.length ?? 0,
      matchedExamWrong: newExamWrongs.some((item) =>
        dailyWrongIds.has(item.id)
      ),
    }
  );

  const inboxAfter = await request({
    role: 'teacher',
    endpoint: '/api/teacher/inbox',
    label: 'r1-teacher-inbox-after',
  });
  const inboxBeforeIds = new Set(
    [
      ...(inboxBefore.data?.recentExam ?? []),
      ...(inboxBefore.data?.stuckAfterGraduation ?? []),
      ...(inboxBefore.data?.neglected ?? []),
    ].map((item) => item.id)
  );
  const inboxAfterIds = new Set(
    [
      ...(inboxAfter.data?.recentExam ?? []),
      ...(inboxAfter.data?.stuckAfterGraduation ?? []),
      ...(inboxAfter.data?.neglected ?? []),
    ].map((item) => item.id)
  );
  const newWrongInInbox = newExamWrongs.some(
    (item) => inboxAfterIds.has(item.id) && !inboxBeforeIds.has(item.id)
  );
  recordCheck(
    'R1-T12-INBOX',
    newWrongInInbox,
    '새 시험 오답이 선생님 처리함에 즉시 노출',
    {
      newExamWrongCount: newExamWrongs.length,
      inboxBeforeCount: inboxBeforeIds.size,
      inboxAfterCount: inboxAfterIds.size,
      matched: newWrongInInbox,
    }
  );

  const roomsAfter = await request({
    role: 'teacher',
    endpoint: '/api/teacher/dashboard/study-rooms',
    label: 'r1-teacher-rooms-after',
  });
  const increased = (roomsAfter.data ?? []).some((after) => {
    const before = roomRowsBefore.find(
      (candidate) =>
        candidate.id === after.id && candidate.studentName === after.studentName
    );
    return before && after.todoCount > before.todoCount;
  });
  recordCheck(
    'R1-T12-COUNT',
    increased,
    '학생 제출 뒤 수업 카드 손볼 것 수 증가',
    {
      beforeTodoCounts: roomRowsBefore.map((item) => item.todoCount),
      afterTodoCounts: (roomsAfter.data ?? [])
        .filter((item) => item.id === roomId)
        .map((item) => item.todoCount),
    }
  );

  const firstWrong = newExamWrongs[0];
  if (!firstWrong) return { examId, attemptId, newExamWrongs };
  const comment = `${runId} 오답 풀이 순서를 다시 확인해요`;
  const commented = await request({
    role: 'teacher',
    method: 'POST',
    endpoint: `/api/teacher/inbox/wrong-answers/${firstWrong.id}/comments`,
    label: 'r1-teacher-comment',
    body: { comment },
  });
  recordCheck(
    'R1-T14',
    commented.status === 200 && commented.data?.teacherComment === comment,
    '선생님 오답 코멘트 저장',
    {
      httpStatus: commented.status,
      exactMatch: commented.data?.teacherComment === comment,
    }
  );

  const wrongAfterComment = await request({
    role: 'student',
    endpoint: '/api/student/wrong-answers?page=0&size=200',
    label: 'r1-student-comment-readback',
  });
  const readback = wrongAfterComment.data?.items?.find(
    (item) => item.id === firstWrong.id
  );
  recordCheck(
    'R1-T16',
    readback?.teacherComment === comment,
    '학생 오답 창고에서 선생님 코멘트 글자 일치',
    { exactMatch: readback?.teacherComment === comment }
  );

  const pin = await request({
    role: 'teacher',
    method: 'POST',
    endpoint: `/api/teacher/exams/attempts/${attemptId}/pins`,
    label: 'r1-create-pin',
    body: { comment },
  });
  const pinId = pin.data?.id;
  recordCheck(
    'R1-T17-PIN',
    pin.status === 200 && Number.isFinite(pinId),
    '선생님 시험 핀 생성',
    {
      httpStatus: pin.status,
      pinId,
    }
  );
  if (pinId) {
    const ack = await request({
      role: 'student',
      method: 'PATCH',
      endpoint: `/api/student/exams/${attemptId}/pins/${pinId}/ack`,
      label: 'r1-ack-pin',
    });
    recordCheck(
      'R1-T17',
      ack.status === 200 &&
        ack.data?.acknowledged === true &&
        ack.data?.acknowledgedAt,
      '학생 확인 처리와 확인 시각 기록',
      sanitize(ack.data)
    );
    const teacherPins = await request({
      role: 'teacher',
      endpoint: '/api/teacher/exams/pins',
      label: 'r1-teacher-pin-readback',
    });
    const teacherPin = teacherPins.data?.find((item) => item.id === pinId);
    recordCheck(
      'R1-T18',
      teacherPins.status === 200 && Boolean(teacherPin?.acknowledgedAt),
      '선생님 핀 목록에서 학생 확인 시각 조회',
      { acknowledgedAtPresent: Boolean(teacherPin?.acknowledgedAt) }
    );
  }

  const reviewed = await request({
    role: 'student',
    method: 'POST',
    endpoint: `/api/student/wrong-answers/${firstWrong.id}/reviews`,
    label: 'regression-wrong-answer-review',
    body: { isCorrect: false, usedHint: false, usedAi: false },
  });
  recordCheck(
    'RG6-WRONG-REVIEW',
    reviewed.status === 200 && reviewed.data?.reviewCount >= 1,
    '시험 오답 회독 1회 저장',
    sanitize(reviewed.data)
  );
  return { examId, attemptId, newExamWrongs };
}

async function runGradeBoundaries(roomId) {
  const cutoffs = [90, 80, 70, 60, 50, 40, 30, 20].map(
    (minRawScore, index) => ({ grade: index + 1, minRawScore })
  );
  const boundaries = [
    { id: 'G17-4', grade: 4, correctCount: 6 },
    { id: 'G18-6', grade: 6, correctCount: 4 },
    { id: 'G19-9', grade: 9, correctCount: 1 },
  ];
  let publicCandidate = null;
  for (const boundary of boundaries) {
    const title = `${runId}-GRADE-${boundary.grade}`;
    const sourcePdfMediaId = await createQaPdfMedia(boundary.grade);
    const created = await createExam({
      title,
      sourcePdfMediaId,
      questions: Array.from({ length: 10 }, (_, index) => ({
        questionNo: index + 1,
        correctAnswer: '1',
        prompt: `${title} ${index + 1}번`,
      })),
    });
    const examId = created.data?.examId;
    if (!examId) {
      recordCheck(
        boundary.id,
        false,
        '등급 경계용 시험 생성',
        sanitize(created.body)
      );
      continue;
    }
    const cutoff = await request({
      role: 'admin',
      method: 'PUT',
      endpoint: `/api/admin/exams/${examId}/grade-cutoff`,
      label: `grade-${boundary.grade}-cutoff`,
      body: {
        source: `${runId} deterministic cutoff`,
        fullScore: 100,
        mean: null,
        stdDev: null,
        cutoffs,
      },
    });
    const assigned = await assignExam(
      examId,
      roomId,
      `grade-${boundary.grade}-assign`
    );
    const hall = await request({
      role: 'student',
      endpoint: '/api/student/exam-hall',
      label: `grade-${boundary.grade}-hall`,
    });
    const attempt = hall.data?.assigned?.find((item) => item.examId === examId);
    if (
      cutoff.status !== 200 ||
      assigned.status !== 200 ||
      !attempt?.attemptId
    ) {
      recordCheck(boundary.id, false, '등급 기준표 등록과 배정', {
        cutoffHttp: cutoff.status,
        assignHttp: assigned.status,
        attemptFound: Boolean(attempt),
      });
      continue;
    }
    const submitted = await request({
      role: 'student',
      method: 'POST',
      endpoint: `/api/student/exams/${attempt.attemptId}/submit`,
      label: `grade-${boundary.grade}-submit`,
      body: {
        answers: Array.from({ length: 10 }, (_, index) => ({
          questionNo: index + 1,
          selectedAnswer: index < boundary.correctCount ? '1' : '2',
          timeSpentSec: 1,
        })),
      },
    });
    const expectedScore = boundary.correctCount * 10;
    const pass =
      submitted.status === 200 &&
      submitted.data?.rawScore === expectedScore &&
      submitted.data?.gradeBasis === 'MEASURED' &&
      submitted.data?.predictedGradeLow === boundary.grade;
    recordCheck(
      boundary.id,
      pass,
      `${expectedScore}점 실측 ${boundary.grade}등급`,
      {
        httpStatus: submitted.status,
        rawScore: submitted.data?.rawScore,
        gradeBasis: submitted.data?.gradeBasis,
        predictedGradeLow: submitted.data?.predictedGradeLow,
        predictedGradeHigh: submitted.data?.predictedGradeHigh,
        standardScore: submitted.data?.standardScore,
      }
    );
    if (boundary.grade === 9) publicCandidate = { examId, title };
  }
  return publicCandidate;
}

async function runAdminAndR2(publicCandidate, roomId) {
  const student2Rooms = await request({
    role: 'student2',
    endpoint: '/api/student/study-rooms',
    label: 'r2-student2-room-state',
  });
  recordCheck(
    'R2-U4-PRECONDITION',
    student2Rooms.status === 200 && student2Rooms.data?.length === 0,
    '학생2는 수업 소속이 없음',
    { roomCount: student2Rooms.data?.length ?? null }
  );
  if (publicCandidate) {
    const posted = await request({
      role: 'admin',
      method: 'POST',
      endpoint: '/api/admin/public-exams',
      label: 'r2-post-public-exam',
      body: {
        examId: publicCandidate.examId,
        audience: 'NO_STUDY_ROOM',
        openAt: new Date(Date.now() - 60_000).toISOString(),
        closeAt: null,
      },
    });
    recordCheck(
      'R2-U3',
      posted.status === 200 && posted.data?.examId === publicCandidate.examId,
      '반 없는 학생 대상으로 공개 응시장 게시',
      sanitize(posted.data)
    );
    const student2Hall = await request({
      role: 'student2',
      endpoint: '/api/student/exam-hall',
      label: 'r2-student2-public-hall',
    });
    const student2Public = student2Hall.data?.public?.find(
      (item) => item.examId === publicCandidate.examId
    );
    recordCheck(
      'R2-U4',
      student2Hall.status === 200 && student2Public?.badge === '공개',
      '수업 없는 학생2 응시장에 공개 배지 시험 표시',
      sanitize(student2Public)
    );
    const studentHall = await request({
      role: 'student',
      endpoint: '/api/student/exam-hall',
      label: 'r2-room-student-public-isolation',
    });
    recordCheck(
      'R2-U5',
      studentHall.status === 200 &&
        !studentHall.data?.public?.some(
          (item) => item.examId === publicCandidate.examId
        ),
      '수업 소속 학생에게 NO_STUDY_ROOM 공개시험 비노출',
      { publicCount: studentHall.data?.public?.length ?? null }
    );
  }

  const members = await request({
    role: 'admin',
    endpoint: '/api/admin/members?page=0&size=5&includeQaAccount=true',
    label: 'admin-members-data',
    capture: false,
  });
  recordCheck(
    'ADMIN-MEMBERS',
    members.status === 200 &&
      members.data?.content?.length > 0 &&
      members.data?.totalElements > 0,
    '회원 관리 목록과 전체 건수',
    {
      httpStatus: members.status,
      count: members.data?.content?.length,
      total: members.data?.totalElements,
    }
  );

  const rooms = await request({
    role: 'admin',
    endpoint: '/api/admin/study-rooms?page=0&size=100',
    label: 'admin-all-study-rooms-data',
    capture: false,
  });
  recordCheck(
    'ADMIN-STUDYROOMS',
    rooms.status === 200 &&
      rooms.data?.content?.some((room) => room.studyRoomId === roomId),
    '수업 전체 목록에서 QA 수업 관계 확인',
    {
      httpStatus: rooms.status,
      count: rooms.data?.content?.length,
      total: rooms.data?.totalElements,
    }
  );

  const publicHall = await request({
    role: 'admin',
    endpoint: '/api/admin/public-exams',
    label: 'admin-public-exam-data',
  });
  recordCheck(
    'ADMIN-PUBLIC-HALL',
    publicHall.status === 200 &&
      (!publicCandidate ||
        publicHall.data?.postings?.some(
          (item) => item.examId === publicCandidate.examId
        )),
    '공개 응시장 게시 데이터 조회',
    {
      httpStatus: publicHall.status,
      postingCount: publicHall.data?.postings?.length ?? null,
    }
  );

  const leads = await request({
    role: 'admin',
    endpoint: '/api/admin/consultation-leads?page=0&size=5',
    label: 'admin-consultation-leads-data',
  });
  recordCheck(
    'ADMIN-CONSULTATION-LEADS',
    leads.status === 200 && Array.isArray(leads.data?.content),
    '문의 리드 목록 응답과 데이터 계약',
    { httpStatus: leads.status, response: sanitize(leads.body) }
  );

  const cases = await request({
    role: 'admin',
    endpoint: '/api/admin/consultation-cases?page=0&size=5',
    label: 'admin-consultation-cases-data',
  });
  recordCheck(
    'ADMIN-CONSULTATION-CASES',
    cases.status === 200 && Array.isArray(cases.data?.content),
    '상담 건 목록 응답과 데이터 계약',
    {
      httpStatus: cases.status,
      count: cases.data?.content?.length ?? null,
      total: cases.data?.totalElements ?? null,
    }
  );
}

async function runPermissions() {
  await expectStatus(
    'P2',
    {
      role: 'admin',
      endpoint: '/api/admin/members?page=0&size=1',
      label: 'admin-members-allowed',
      capture: false,
    },
    [200]
  );
  await expectStatus(
    'P1',
    {
      role: 'admin',
      endpoint: '/api/teacher/dashboard/study-rooms',
      label: 'admin-teacher-denied',
    },
    [403]
  );
  await expectStatus(
    'P5',
    {
      role: 'teacher',
      endpoint: '/api/admin/summary?days=30',
      label: 'teacher-admin-denied',
    },
    [403]
  );
  await expectStatus(
    'P6',
    {
      role: 'student',
      endpoint: '/api/teacher/dashboard/study-rooms',
      label: 'student-teacher-denied',
    },
    [403]
  );
  await expectStatus(
    'P8-API',
    {
      role: 'student',
      endpoint: '/api/admin/members?page=0&size=1',
      label: 'student-admin-denied',
    },
    [403]
  );
}

async function runUploadRegression() {
  for (const role of ['student', 'teacher', 'admin']) {
    const endpoint =
      role === 'admin'
        ? '/api/admin/media/presign-batch'
        : '/api/common/media/presign-batch';
    const presigned = await request({
      role,
      method: 'POST',
      endpoint,
      label: `upload-${role}-presign`,
      body: {
        mediaAssetList: [
          {
            fileName: `${runId}-${role}.png`,
            contentType: 'image/png',
            sizeBytes: 8,
            targetType: 'PENDING_ATTACHMENT',
          },
        ],
      },
    });
    const asset = presigned.data?.mediaAssetList?.[0];
    let uploadStatus = null;
    if (asset?.uploadUrl) {
      const response = await fetch(asset.uploadUrl, {
        method: 'PUT',
        headers: { ...(asset.headers ?? {}), 'Content-Type': 'image/png' },
        body: Buffer.from('QA-PNG-1'),
        signal: AbortSignal.timeout(30_000),
      });
      uploadStatus = response.status;
      await response.arrayBuffer();
      evidence.push({
        label: `upload-${role}-put`,
        role,
        method: 'PUT',
        endpoint: '[REDACTED_SIGNED_URL]',
        httpStatus: response.status,
        request: { bytes: 8, contentType: 'image/png' },
        response: null,
      });
    }
    recordCheck(
      `RG3-UPLOAD-${role.toUpperCase()}`,
      presigned.status === 200 &&
        Boolean(asset?.mediaId) &&
        uploadStatus === 200,
      `${role} 업로드 URL 발급과 실제 PUT`,
      {
        presignHttp: presigned.status,
        mediaIdPresent: Boolean(asset?.mediaId),
        uploadHttp: uploadStatus,
      }
    );
  }
}

async function runOpenChallengeRegression() {
  const listed = await request({
    endpoint: '/api/public/challenges?page=0&size=3',
    label: 'open-challenge-public-list',
  });
  const item = listed.data?.content?.[0];
  recordCheck(
    'RG7-OPEN-LIST',
    listed.status === 200 &&
      listed.data?.content?.length > 0 &&
      item?.challengeId,
    '오픈챌린지 공개 목록 실데이터',
    {
      httpStatus: listed.status,
      count: listed.data?.content?.length ?? null,
      challengeId: item?.challengeId,
    }
  );
  if (!item?.challengeId) return;
  const detail = await request({
    endpoint: `/api/public/challenges/${item.challengeId}`,
    label: 'open-challenge-public-detail',
  });
  const choice = detail.data?.choices?.[0];
  const created = await request({
    role: 'student2',
    method: 'POST',
    endpoint: '/api/common/challenge-attempts',
    label: 'open-challenge-attempt-create',
    body: { challengeId: item.challengeId },
  });
  const attemptId = created.data?.attemptId;
  let submitted = { status: 0, data: null };
  if (attemptId && choice) {
    submitted = await request({
      role: 'student2',
      method: 'POST',
      endpoint: `/api/common/challenge-attempts/${attemptId}/submit`,
      label: 'open-challenge-attempt-submit',
      body: {
        selectedAnswer: choice,
        drawingData: null,
        drawingImageMediaId: null,
      },
    });
  }
  recordCheck(
    'RG7-OPEN-SUBMIT',
    detail.status === 200 &&
      detail.data?.choices?.length > 0 &&
      created.status === 200 &&
      submitted.status === 200,
    '오픈챌린지 상세, 응시 시작, 답안 제출',
    {
      detailHttp: detail.status,
      choiceCount: detail.data?.choices?.length ?? null,
      createHttp: created.status,
      submitHttp: submitted.status,
      attemptId,
      correctFieldPresent: typeof submitted.data?.correct === 'boolean',
    }
  );
}

async function runReadPathRegressions() {
  const studentExams = await request({
    role: 'student',
    endpoint: '/api/student/exams',
    label: 'student-existing-exam-list',
  });
  recordCheck(
    'RG1-STUDENT-EXAMS',
    studentExams.status === 200 && Array.isArray(studentExams.data),
    '기존 학생 배정 시험 목록 경로',
    {
      httpStatus: studentExams.status,
      examCount: Array.isArray(studentExams.data)
        ? studentExams.data.length
        : null,
    }
  );

  const teacherRecommendations = await request({
    role: 'teacher',
    endpoint: '/api/teacher/todos/recommendations',
    label: 'teacher-todo-recommendations-after-exam',
  });
  const runRecommendation = teacherRecommendations.data?.items?.find(
    (item) => item.book === `${runId}-R1` && item.approvalStatus === 'PENDING'
  );
  let approvedRecommendation = { status: 0, data: null };
  if (runRecommendation?.id) {
    approvedRecommendation = await request({
      role: 'teacher',
      method: 'POST',
      endpoint: `/api/teacher/todos/recommendations/${runRecommendation.id}/approve`,
      label: 'teacher-approve-exam-todo-recommendation',
    });
  }
  const studentTodos = await request({
    role: 'student',
    endpoint: '/api/student/todos',
    label: 'student-todos-after-exam',
  });
  recordCheck(
    'R1-T15-TODO-SUPPLY',
    teacherRecommendations.status === 200 &&
      Boolean(runRecommendation?.id) &&
      approvedRecommendation.status === 200 &&
      studentTodos.status === 200 &&
      studentTodos.data?.items?.some(
        (item) => item.id === approvedRecommendation.data?.id
      ),
    '시험 제출 뒤 선생님 추천 공급, 승인, 학생 할 일 노출',
    {
      teacherHttp: teacherRecommendations.status,
      teacherTotalCount: teacherRecommendations.data?.totalCount ?? null,
      recommendationFound: Boolean(runRecommendation?.id),
      approveHttp: approvedRecommendation.status,
      studentHttp: studentTodos.status,
      studentTotalCount: studentTodos.data?.totalCount ?? null,
      approvedTodoVisible: studentTodos.data?.items?.some(
        (item) => item.id === approvedRecommendation.data?.id
      ),
    }
  );
}

async function runHtmlFallback() {
  const pages = [
    { role: 'student', endpoint: '/dashboard/student', id: 'HTML-STUDENT' },
    { role: 'teacher', endpoint: '/dashboard/teacher', id: 'HTML-TEACHER' },
    { role: 'admin', endpoint: '/admin/members', id: 'HTML-ADMIN-MEMBERS' },
    { role: 'admin', endpoint: '/admin/study-rooms', id: 'HTML-ADMIN-ROOMS' },
    { role: 'admin', endpoint: '/admin/public-exams', id: 'HTML-ADMIN-HALL' },
    {
      role: 'admin',
      endpoint: '/admin/consultations',
      id: 'HTML-ADMIN-CONSULTATIONS',
    },
  ];
  for (const page of pages) {
    const response = await fetch(`${WEB_BASE}${page.endpoint}`, {
      headers: { Cookie: cookies.get(page.role) ?? '' },
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
    const html = await response.text();
    const hasAuthErrorText = /401 인증 필요|인증이 필요|로그인이 필요/.test(
      html
    );
    recordCheck(
      page.id,
      response.status === 200 && !hasAuthErrorText && html.length > 1000,
      '서버 HTML 응답, 인증 오류 원문 비노출, 비어 있지 않은 문서',
      { httpStatus: response.status, htmlBytes: html.length, hasAuthErrorText }
    );
    evidence.push({
      label: page.id,
      role: page.role,
      method: 'GET',
      endpoint: page.endpoint,
      httpStatus: response.status,
      request: null,
      response: { htmlBytes: html.length, hasAuthErrorText },
    });
  }
}

async function main() {
  const health = await request({
    endpoint: '/api/admin/actuator/health',
    label: 'health',
  });
  recordCheck(
    'HEALTH',
    health.status === 200 && health.body?.status === 'UP',
    'dev backend health 본문',
    {
      httpStatus: health.status,
      status: health.body?.status,
    }
  );
  for (const role of ['student', 'student2', 'teacher', 'admin'])
    await login(role);
  await runPermissions();

  const initialStudent2Hall = await request({
    role: 'student2',
    endpoint: '/api/student/exam-hall',
    label: 'edge-student2-empty-hall-before-qa-data',
  });
  recordCheck(
    'EDGE-EMPTY-HALL',
    initialStudent2Hall.status === 200 &&
      initialStudent2Hall.data?.assigned?.length === 0 &&
      Array.isArray(initialStudent2Hall.data?.public),
    '학생2 개인 배정 빈 상태와 공개시험 시드 응답',
    {
      assigned: initialStudent2Hall.data?.assigned?.length ?? null,
      public: initialStudent2Hall.data?.public?.length ?? null,
    }
  );

  const setup = await createRoomAndInvite();
  let r1 = null;
  let publicCandidate = null;
  if (setup?.roomId) {
    r1 = await runR1(setup.roomId);
    publicCandidate = await runGradeBoundaries(setup.roomId);
    await runAdminAndR2(publicCandidate, setup.roomId);
  } else {
    recordCheck('R1-BLOCKED', false, 'QA 수업 생성 실패로 R1 데이터 체인 차단');
  }
  await runUploadRegression();
  await runOpenChallengeRegression();
  await runReadPathRegressions();
  await runHtmlFallback();

  const summary = {
    runId,
    generatedAt: new Date().toISOString(),
    apiBase: API_BASE,
    webBase: WEB_BASE,
    totals: {
      pass: checks.filter((item) => item.status === 'PASS').length,
      fail: checks.filter((item) => item.status === 'FAIL').length,
      all: checks.length,
    },
    r1: sanitize(r1),
    publicCandidate: sanitize(publicCandidate),
    checks,
    evidence,
  };
  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(summary, null, 2)}\n`, {
    mode: 0o600,
  });
  console.log(
    JSON.stringify({
      evidencePath: EVIDENCE_PATH,
      runId,
      totals: summary.totals,
    })
  );
  process.exitCode = summary.totals.fail > 0 ? 1 : 0;
}

main().catch((error) => {
  const failure = {
    runId,
    generatedAt: new Date().toISOString(),
    fatal: sanitize({
      name: error.name,
      message: error.message,
      stack: error.stack,
    }),
    checks,
    evidence,
  };
  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(failure, null, 2)}\n`, {
    mode: 0o600,
  });
  console.error(
    JSON.stringify({ evidencePath: EVIDENCE_PATH, fatal: error.message })
  );
  process.exitCode = 2;
});

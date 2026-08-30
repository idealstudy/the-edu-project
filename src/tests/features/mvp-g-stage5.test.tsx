import { payload } from '@/entities/exam';
import { ExamHallCard } from '@/features/dashboard/components/student/exam-hall-card';
import { ExamCreate } from '@/features/exam/components/exam-create';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  assignedExams: vi.fn(),
  examAnalysis: vi.fn(),
  studentReport: vi.fn(),
  questionBank: vi.fn(),
  createExam: vi.fn(),
  assignExam: vi.fn(),
}));

vi.mock('@/features/exam/hooks/use-exam-query', () => ({
  useAssignedExamsQuery: mocks.assignedExams,
  useExamAnalysisQuery: mocks.examAnalysis,
  useQuestionBankQuery: mocks.questionBank,
}));

vi.mock('@/features/dashboard/hooks/use-student-dashboard-query', () => ({
  useStudentDashboardReportQuery: mocks.studentReport,
}));

vi.mock('@/features/dashboard/hooks/use-teacher-dashboard-query', () => ({
  useTeacherDashboardStudyRoomListQuery: () => ({
    data: [{ id: 41, name: '수학 집중반' }],
  }),
}));

vi.mock('@/features/exam/hooks/use-exam-mutation', () => ({
  useCreateExam: () => ({ isPending: false, mutateAsync: mocks.createExam }),
  useAssignExam: () => ({ isPending: false, mutateAsync: mocks.assignExam }),
}));

vi.mock('@/features/exam/components/tree-node-picker', () => ({
  TreeNodePicker: () => <button type="button">단원 전체</button>,
}));

const emptyReport = {
  studyRoomCount: 0,
  questionCount: 0,
  answerCount: 0,
  submittedHomeworkCount: 0,
  referenceExpectedGrade: null,
};

describe('MVP-G 5단계 회장 결정 보정', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('t-exam-error는 상단 경고와 2 CTA, 담은 10문항 요약을 유지한다', async () => {
    mocks.createExam.mockResolvedValue({ examId: 501 });
    mocks.assignExam.mockRejectedValue(new Error('배정 API 실패'));
    mocks.questionBank.mockReturnValue({
      data: {
        content: Array.from({ length: 10 }, (_, index) => ({
          challengeId: index + 1,
          title: `문항 ${index + 1}`,
          questionText: `시험 문항 ${index + 1}`,
          treeNodeId: index + 100,
          treeNodePath: '수학 > 수열',
          sourceText: '6월 학력평가',
          difficulty: 'MID',
          wrongAnswerRate: 30,
          hasCorrectAnswer: true,
          questionImageUrl: null,
        })),
        totalElements: 10,
        page: 0,
        size: 20,
      },
      isPending: false,
      isError: false,
    });

    render(<ExamCreate />);
    act(() => {
      for (const button of screen.getAllByRole('button', { name: '담기' })) {
        button.click();
      }
    });
    fireEvent.click(screen.getByTestId('teacher-exam-assign-button'));

    const warning = await screen.findByTestId('exam-create-error');
    expect(within(warning).getByText('시험이 저장되지 않았어요')).toBeVisible();
    expect(
      within(warning).getByRole('button', { name: '다시 내기' })
    ).toBeVisible();
    expect(
      within(warning).getByRole('button', { name: '임시 보관함에 넣어두기' })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: '담은 문항 10개' })
    ).toBeVisible();
    expect(
      screen.getByText(
        /\uB098\uBA38\uC9C0 7\uBB38\uD56D\uB3C4 \uC720\uC9C0\uB429\uB2C8\uB2E4/
      )
    ).toBeVisible();
    expect(screen.queryByText('3 담은 문항 확인')).not.toBeInTheDocument();
    expect(screen.queryByTestId('teacher-exam-pdf-method')).toBeNull();

    fireEvent.click(
      within(warning).getByRole('button', { name: '임시 보관함에 넣어두기' })
    );
    expect(within(warning).getByRole('status')).toHaveTextContent(
      '담은 문항 10개를 이 화면에 임시 보관했습니다.'
    );
  });

  it('시험이 없고 채점 풀이가 충분하면 시험 아님 참고 등급과 근거 세 줄을 표시한다', () => {
    mocks.assignedExams.mockReturnValue({ data: [], isPending: false });
    mocks.examAnalysis.mockReturnValue({ data: undefined, isPending: false });
    mocks.studentReport.mockReturnValue({
      data: {
        ...emptyReport,
        referenceExpectedGrade: {
          predictedGradeLow: 3,
          predictedGradeHigh: 4,
          gradedQuestionCount: 23,
          evidence: [
            {
              source: 'GRADED_SOLUTIONS',
              label: '푼 문항 정답률 78%',
              value: 78,
            },
            {
              source: 'WRONG_ANSWER_REVIEW',
              label: '오답 회독 진행도 64%',
              value: 64,
            },
            {
              source: 'WEAKNESS_TREE',
              label: '약점트리 평균 숙련도 71점',
              value: 71,
            },
          ],
          gradeBasis: 'REFERENCE',
          dataNotice:
            '시험 결과가 아닌 채점된 풀이 기록으로 계산한 참고 범위입니다.',
        },
      },
      isPending: false,
    });

    render(<ExamHallCard />);

    const reference = screen.getByTestId('expected-grade-reference');
    expect(within(reference).getByText('내 위치 · 참고')).toBeVisible();
    expect(within(reference).getByText('시험 아님')).toBeVisible();
    expect(within(reference).getByText('23문항 기준')).toBeVisible();
    expect(within(reference).getByText('3~4등급')).toBeVisible();
    expect(within(reference).getByText('푼 문항 정답률 78%')).toBeVisible();
    expect(
      within(reference).getByTestId('expected-grade-reference-evidence')
        .children
    ).toHaveLength(3);
  });

  it('근거가 부족하면 등급 영역에 숫자와 자리표시자를 쓰지 않는다', () => {
    mocks.assignedExams.mockReturnValue({ data: [], isPending: false });
    mocks.examAnalysis.mockReturnValue({ data: undefined, isPending: false });
    mocks.studentReport.mockReturnValue({
      data: emptyReport,
      isPending: false,
    });

    render(<ExamHallCard />);

    const none = screen.getByTestId('expected-grade-none');
    expect(none).toHaveTextContent('아직 등급을 계산할 자료가 없어요');
    expect(none.textContent).not.toMatch(/[0-9]/);
    expect(none.textContent).not.toContain('--등급');
  });

  it('TC-API-002 시험 만들기가 고1·고2 학년을 실제 문제은행 필터로 보낸다', async () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
    mocks.questionBank.mockReturnValue({
      data: { content: [], totalElements: 0, page: 0, size: 20 },
      isPending: false,
      isError: false,
    });

    render(<ExamCreate />);

    expect(screen.getByTestId('exam-subject-filter')).toHaveTextContent('수학');
    expect(screen.getByText('3 담은 문항 확인')).toBeVisible();
    expect(screen.getByTestId('teacher-exam-pdf-method')).toBeVisible();
    expect(screen.getByLabelText('과목 필터')).toBeVisible();
    expect(screen.getByTestId('exam-grade-filter')).toHaveTextContent('고2');
    expect(mocks.questionBank).toHaveBeenCalledWith(
      expect.objectContaining({ grade: 'HIGH_2' })
    );

    fireEvent.click(screen.getByTestId('exam-grade-filter'));
    expect(screen.queryByRole('option', { name: '고3' })).toBeNull();
    fireEvent.click(await screen.findByRole('option', { name: '고1' }));
    await waitFor(() =>
      expect(mocks.questionBank).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'HIGH_1', treeNodeIds: [] })
      )
    );

    const parsed = payload.questionBankParams.parse({
      subject: 'ENGLISH',
      grade: 'HIGH_1',
      treeNodeIds: [],
      excludeChallengeIds: [],
      page: 0,
      size: 20,
    });
    expect(parsed.subject).toBe('ENGLISH');
    expect(parsed.grade).toBe('HIGH_1');
    expect(() =>
      payload.questionBankParams.parse({
        subject: 'MATH',
        grade: 'HIGH_3',
        treeNodeIds: [],
        excludeChallengeIds: [],
      })
    ).toThrow();
  });

  it('빈 문제은행에서 PDF 직접 올리기를 누르면 PDF 경로 카드로 이동한다', async () => {
    const user = userEvent.setup();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
    mocks.questionBank.mockReturnValue({
      data: { content: [], totalElements: 0, page: 0, size: 20 },
      isPending: false,
      isError: false,
    });

    render(<ExamCreate />);
    await waitFor(() =>
      expect(screen.getByTestId('teacher-exam-assign-button')).toBeDisabled()
    );
    await user.click(screen.getByRole('button', { name: 'PDF로 직접 올리기' }));

    expect(screen.getByTestId('teacher-exam-pdf-method')).toHaveFocus();
  });
});

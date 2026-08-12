import { ExamHallCard } from '@/features/dashboard/components/student/exam-hall-card';
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * DESIGN.md §6.3.1 / build-brief G1: 예상 등급 게이지는 1~9등급이어야 한다.
 * 회귀 대상: exam-hall-card.tsx GRADE_MAX가 5로 되돌아가면 9등급 학생의
 * 눈금 라벨이 사라지고 막대가 100%를 넘겨 잘린다.
 */

const mocks = vi.hoisted(() => ({
  assignedExams: vi.fn(),
  examAnalysis: vi.fn(),
  studentReport: vi.fn(),
}));

vi.mock('@/features/exam/hooks/use-exam-query', () => ({
  useAssignedExamsQuery: mocks.assignedExams,
  useExamAnalysisQuery: mocks.examAnalysis,
}));

vi.mock('@/features/dashboard/hooks/use-student-dashboard-query', () => ({
  useStudentDashboardReportQuery: mocks.studentReport,
}));

describe('MVP-G 예상 등급 게이지 (G1: 1~9등급)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('9등급 데이터를 받으면 눈금 라벨 1~9가 전부 보이고 막대가 100% 안에 들어간다', () => {
    mocks.assignedExams.mockReturnValue({
      data: [{ attemptId: 1, status: 'ANALYZED' }],
      isPending: false,
    });
    mocks.examAnalysis.mockReturnValue({
      data: {
        gradeBasis: 'MEASURED',
        predictedGradeLow: 9,
        predictedGradeHigh: 9,
        standardScore: null,
        evidence: [],
        dataNotice: '',
      },
      isPending: false,
    });
    mocks.studentReport.mockReturnValue({ data: undefined, isPending: false });

    render(<ExamHallCard />);

    const card = screen.getByTestId('expected-grade-card');
    for (const grade of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(within(card).getByText(String(grade))).toBeVisible();
    }

    const bar = screen.getByTestId('expected-grade-range-bar');
    const fill = bar.querySelector('i');
    expect(fill).not.toBeNull();

    const left = parseFloat((fill?.getAttribute('style') ?? '').match(/left:\s*([\d.]+)%/)?.[1] ?? '0');
    const width = parseFloat((fill?.getAttribute('style') ?? '').match(/width:\s*([\d.]+)%/)?.[1] ?? '0');
    expect(left + width).toBeLessThanOrEqual(100);
    expect(left).toBeGreaterThanOrEqual(0);
  });
});

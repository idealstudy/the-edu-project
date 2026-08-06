import type { ExamAnalysis } from '@/entities/exam';
import { ExamAnalysisCard } from '@/features/exam/components/exam-analysis-card';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/exam/hooks/use-exam-mutation', () => ({
  useAcknowledgeExamPin: () => ({ isPending: false, mutate: vi.fn() }),
}));

const predicted: ExamAnalysis = {
  attemptId: 901,
  examTitle: '수열 진단시험',
  examType: 'SCHOOL',
  rawScore: 80,
  predictedGradeLow: 2,
  predictedGradeHigh: 4,
  weakUnits: [{ treeNodeId: 11, name: '수열', wrongCount: 2 }],
  evidence: [
    { source: 'EXAM_SCORE', label: '시험 정답률 80%', value: 80 },
    {
      source: 'WRONG_ANSWER_REVIEW',
      label: '오답 회독 진행도 40%',
      value: 40,
    },
    {
      source: 'WEAKNESS_TREE',
      label: '약점트리 평균 숙련도 55점',
      value: 55,
    },
  ],
  teacherPins: [],
  estimateSource: 'AI_STUB',
  realDataLinked: false,
  referenceOnly: true,
  realDataFollowUpRequired: true,
  dataNotice: 'AI 예측이며 실측이 아닙니다.',
  gradeBasis: 'PREDICTED',
  standardScore: null,
  confidence: '낮음',
  adjustmentReason: '기존 규칙 기준선을 유지했습니다.',
  totalQuestions: 10,
  answerResults: [{ questionNo: 1, correct: true }],
};

describe('MVP-G 2단계 시험 분석', () => {
  it('예측은 범위, 실측 아님, 근거 3줄을 펼쳐서 표시한다', () => {
    render(<ExamAnalysisCard analysis={predicted} />);

    const grade = screen.getByTestId('exam-grade-result');
    expect(grade).toHaveTextContent('2~4등급');
    expect(screen.getByText('AI 예측', { exact: true })).toBeVisible();
    expect(screen.getByText('실측 아님', { exact: true })).toBeVisible();
    expect(screen.getByText('신뢰 낮음', { exact: true })).toBeVisible();

    const evidence = screen.getByTestId('exam-prediction-evidence');
    expect(within(evidence).getByText('시험 정답률 80%')).toBeVisible();
    expect(within(evidence).getByText('오답 회독 진행도 40%')).toBeVisible();
    expect(
      within(evidence).getByText('약점트리 평균 숙련도 55점')
    ).toBeVisible();
  });

  it('기준표가 있으면 단일 등급과 표준점수를 표시한다', () => {
    render(
      <ExamAnalysisCard
        analysis={{
          ...predicted,
          predictedGradeLow: 2,
          predictedGradeHigh: 3,
          estimateSource: 'EBSI_REAL',
          realDataLinked: true,
          referenceOnly: false,
          realDataFollowUpRequired: false,
          gradeBasis: 'MEASURED',
          standardScore: 128,
          confidence: '높음',
          adjustmentReason: null,
        }}
      />
    );

    expect(screen.getByTestId('exam-grade-result')).toHaveTextContent(
      '2~3등급'
    );
    expect(screen.getByText('표준점수 128', { exact: true })).toBeVisible();
    expect(screen.queryByText('실측 아님', { exact: true })).toBeNull();
  });
});

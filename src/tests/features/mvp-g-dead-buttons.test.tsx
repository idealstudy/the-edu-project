import { TodayTodoCard } from '@/features/dashboard/components/student/today-todo-card';
import DashboardTeacher from '@/features/dashboard/components/teacher';
import { LearningInboxCard } from '@/features/dashboard/components/teacher/learning-inbox-card';
import { LearningManagementTab } from '@/features/study-notes/components/learning-management-tab';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  approveTodo: vi.fn(),
  createTodo: vi.fn(),
  saveComment: vi.fn(),
  studentTodos: vi.fn(),
  teacherRooms: vi.fn(),
  teacherInbox: vi.fn(),
  teacherRecommendations: vi.fn(),
  changeRoomStatus: vi.fn(),
  updateTodo: vi.fn(),
}));

vi.mock('@/features/dashboard/hooks/use-todo-query', () => ({
  useApproveTodoRecommendation: () => ({
    isPending: false,
    mutate: mocks.approveTodo,
  }),
  useCreateTodo: () => ({ isPending: false, mutate: mocks.createTodo }),
  useStudentTodosQuery: mocks.studentTodos,
  useTeacherTodoRecommendationsQuery: mocks.teacherRecommendations,
  useUpdateTodo: () => ({ isPending: false, mutate: mocks.updateTodo }),
}));

vi.mock('@/features/dashboard/hooks/use-wrong-answer-query', () => ({
  useSaveTeacherWrongAnswerComment: () => ({
    isPending: false,
    mutate: mocks.saveComment,
  }),
  useTeacherWrongAnswerInboxQuery: mocks.teacherInbox,
}));

vi.mock('@/features/dashboard/hooks/use-teacher-dashboard-query', () => ({
  useTeacherDashboardStudyRoomListQuery: mocks.teacherRooms,
}));

vi.mock('@/features/dashboard/hooks/use-change-study-room-status', () => ({
  useChangeStudyRoomStatus: () => ({
    isError: false,
    isPending: false,
    mutate: mocks.changeRoomStatus,
  }),
}));

/** v22 학습 관리 처리 행 계약. 이 테스트는 진입점 링크만 보므로 처리 행은 비워 둔다. */
vi.mock('@/features/study-notes/hooks/use-learning-management', () => {
  const idleMutation = () => ({ mutate: vi.fn(), isPending: false });
  return {
    useLearningManagementQuery: () => ({
      data: {
        pendingCount: 0,
        noteRows: [],
        todoRows: [],
        feedbackRows: [],
      },
      isPending: false,
      isError: false,
    }),
    useLearningManagementActions: () => ({
      deferTodo: idleMutation(),
      acknowledgeTodo: idleMutation(),
      approveRecommendation: idleMutation(),
      rejectRecommendation: idleMutation(),
      acknowledgeWrongAnswer: idleMutation(),
      acknowledgeAllWrongAnswers: idleMutation(),
      saveComment: idleMutation(),
    }),
  };
});

const EMPTY_TODOS = {
  weekOf: '2026-08-03',
  weekEnd: '2026-08-09',
  totalCount: 0,
  doneCount: 0,
  skippedCount: 0,
  items: [],
};

const WRAPPER_ACTIONS = new Set([
  'Dialog.Close',
  'Dialog.Trigger',
  'Popover.Close',
  'Popover.Trigger',
  'Select.Option',
]);

const listTsxFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listTsxFiles(fullPath);
    return entry.name.endsWith('.tsx') ? [fullPath] : [];
  });

const hasAttribute = (node: ts.JsxOpeningLikeElement, attributeName: string) =>
  node.attributes.properties.some(
    (attribute) =>
      ts.isJsxAttribute(attribute) && attribute.name.getText() === attributeName
  );

const isSubmitButton = (node: ts.JsxOpeningLikeElement) =>
  node.attributes.properties.some(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      attribute.name.getText() === 'type' &&
      attribute.initializer?.getText().includes('submit')
  );

const hasActionWrapper = (node: ts.Node) => {
  let parent = node.parent;
  while (parent) {
    if (ts.isJsxElement(parent)) {
      const tagName = parent.openingElement.tagName.getText();
      if (WRAPPER_ACTIONS.has(tagName)) return true;
    }
    parent = parent.parent;
  }
  return false;
};

describe('MVP-G 죽은 버튼 회귀', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.studentTodos.mockReturnValue({
      data: EMPTY_TODOS,
      isError: false,
      isPending: false,
    });
    mocks.teacherRecommendations.mockReturnValue({
      data: EMPTY_TODOS,
      isPending: false,
    });
    mocks.teacherRooms.mockReturnValue({
      data: [
        {
          id: 41,
          name: '김서준 수업',
          studentName: '김서준',
          state: 'ACTIVE',
          enrollmentStatus: 'OPERATING',
          todoCount: 1,
          todoBreakdown: {
            commentNeeded: 1,
            todoApproval: 0,
            notDoneReason: 0,
            unreadSubmission: 0,
          },
        },
      ],
      isPending: false,
    });
  });

  it('선생님 대시보드가 기존 수업 목록을 렌더한다(처리함 워크플로우는 시안맞춤 v23.5로 제거됨)', () => {
    render(<DashboardTeacher initialMemberName="한지원" />);

    const roomList = screen.getByTestId('teacher-rooms-list');
    expect(roomList).toBeVisible();
    expect(screen.getByText(/김서준 수업/)).toBeVisible();
    expect(
      screen.queryByTestId('teacher-learning-inbox-after-rooms')
    ).not.toBeInTheDocument();
  });

  it('수업 0 빈 상태는 승인된 두 복구 행동만 첫 화면에 둔다', () => {
    mocks.teacherRooms.mockReturnValue({ data: [], isPending: false });

    render(<DashboardTeacher initialMemberName="한지원" />);

    expect(screen.getByTestId('teacher-rooms-empty')).toBeVisible();
    expect(
      screen.getByRole('link', { name: '첫 스터디룸 만들기' })
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: '학생 초대 코드 보기' })
    ).toBeVisible();
    expect(
      screen.queryByTestId('teacher-learning-inbox-after-rooms')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '수업 만들기' })).toBeNull();
  });

  it('수업 종료 버튼은 CLOSED 저장을 호출한다', async () => {
    const user = userEvent.setup();
    render(<DashboardTeacher initialMemberName="한지원" />);

    await user.click(
      screen.getByRole('button', { name: '김서준 스터디룸 더 보기' })
    );
    await user.click(screen.getByRole('button', { name: '이 수업 종료하기' }));

    expect(mocks.changeRoomStatus).toHaveBeenCalledWith(
      { studyRoomId: 41, status: 'CLOSED' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('종료된 수업은 접힌 목록에서 OPERATING으로 재개한다', async () => {
    const user = userEvent.setup();
    mocks.teacherRooms.mockReturnValue({
      data: [
        {
          id: 41,
          name: '김서준 수업',
          studentName: '김서준',
          state: 'ACTIVE',
          enrollmentStatus: 'CLOSED',
          todoCount: 0,
          todoBreakdown: {
            commentNeeded: 0,
            todoApproval: 0,
            notDoneReason: 0,
            unreadSubmission: 0,
          },
        },
      ],
      isPending: false,
    });

    render(<DashboardTeacher initialMemberName="한지원" />);
    await user.click(screen.getByRole('button', { name: '종료된 것 보기' }));
    await user.click(screen.getByRole('button', { name: '재개하기' }));

    expect(mocks.changeRoomStatus).toHaveBeenCalledWith(
      { studyRoomId: 41, status: 'OPERATING' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('학습 관리의 7개 진입점을 현재 스터디룸 기준 실라우트에 연결한다', () => {
    render(<LearningManagementTab studyRoomId={41} />);

    expect(screen.getByText('＋ 개념 노트').closest('a')).toHaveAttribute(
      'href',
      '/study-rooms/41/note/new'
    );
    expect(screen.getByText('＋ 할 일').closest('a')).toHaveAttribute(
      'href',
      '/study-rooms/41/member'
    );
    expect(screen.getByText('＋ 피드백').closest('a')).toHaveAttribute(
      'href',
      '/study-rooms/41/member'
    );
    expect(screen.getByRole('link', { name: '시험 열기' })).toHaveAttribute(
      'href',
      '/dashboard/teacher/exams?studyRoomId=41'
    );
  });

  it('학생이 오늘 할 일을 직접 입력해 기존 생성 훅으로 저장한다', async () => {
    const user = userEvent.setup();
    mocks.createTodo.mockImplementation(
      (_input: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }
    );

    render(<TodayTodoCard />);
    await user.click(screen.getByTestId('student-todo-add-toggle'));
    await user.type(screen.getByLabelText('새 할 일'), '수열 오답 3개 풀기');
    await user.click(screen.getByRole('button', { name: '추가하기' }));

    expect(mocks.createTodo).toHaveBeenCalledWith(
      {
        title: '수열 오답 3개 풀기',
        subject: null,
        book: null,
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      })
    );
  });

  it('선생님 자유 코멘트를 기존 오답 코멘트 저장 훅으로 보낸다', async () => {
    const user = userEvent.setup();
    mocks.teacherInbox.mockReturnValue({
      data: {
        recentExamCount: 1,
        recentExam: [
          {
            id: 7,
            studentId: 9,
            title: '수열 12번',
            status: 'ACTIVE',
            reviewCount: 1,
            wrongAgainCount: 0,
            hintFreeSolveCount: 0,
            teacherComment: null,
          },
        ],
        neglectedCount: 0,
        neglected: [],
        stuckAfterGraduationCount: 0,
        stuckAfterGraduation: [],
        neglectedThresholdDays: 3,
      },
      isPending: false,
    });
    mocks.saveComment.mockImplementation(
      (_input: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }
    );

    render(<LearningInboxCard />);
    await user.click(screen.getByRole('button', { name: '직접 쓰기' }));
    await user.type(
      screen.getByLabelText('수열 12번 자유 코멘트'),
      '풀이 첫 줄에서 공식을 다시 확인해보자'
    );
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(mocks.saveComment).toHaveBeenCalledWith(
      { id: 7, comment: '풀이 첫 줄에서 공식을 다시 확인해보자' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('대시보드와 스터디노트에 무동작 일반 버튼과 조건 없는 disabled를 남기지 않는다', () => {
    const sourceRoots = [
      path.join(process.cwd(), 'src/features/dashboard'),
      path.join(process.cwd(), 'src/features/study-notes'),
    ];
    const violations: string[] = [];

    sourceRoots.flatMap(listTsxFiles).forEach((filePath) => {
      const sourceFile = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );

      const visit = (node: ts.Node) => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const tagName = node.tagName.getText(sourceFile);
          const line =
            sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
              .line + 1;
          const location = `${path.relative(process.cwd(), filePath)}:${line}`;

          if (
            tagName === 'button' &&
            !hasAttribute(node, 'onClick') &&
            !hasAttribute(node, 'href') &&
            !isSubmitButton(node) &&
            !hasActionWrapper(node)
          ) {
            violations.push(`${location} 무동작 button`);
          }

          const unconditionalDisabled = node.attributes.properties.some(
            (attribute) =>
              ts.isJsxAttribute(attribute) &&
              attribute.name.getText(sourceFile) === 'disabled' &&
              !attribute.initializer
          );
          if (unconditionalDisabled) {
            violations.push(`${location} 조건 없는 disabled`);
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    });

    expect(violations).toEqual([]);
  });
});

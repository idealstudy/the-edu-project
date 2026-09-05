import { AdminMemberDetail } from '@/features/admin-member/components/admin-member-detail';
import { AdminMemberList } from '@/features/admin-member/components/admin-member-list';
import { AdminConsultations } from '@/features/admin-operations/components/admin-consultations';
import { AdminPublicHall } from '@/features/admin-operations/components/admin-public-hall';
import { AdminStudyRooms } from '@/features/admin-operations/components/admin-study-rooms';
import { AdminQuestionBank } from '@/features/admin-question-bank/components/admin-question-bank';
import { AdminOpenChallengeForm } from '@/features/open-challenge-admin/components/admin-open-challenge-form';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  members: vi.fn(),
  member: vi.fn(),
  hall: vi.fn(),
  rooms: vi.fn(),
  consultations: vi.fn(),
  questionBank: vi.fn(),
  impersonate: vi.fn(),
}));

vi.mock('@/features/admin-member/hooks/use-admin-members', () => ({
  useAdminMembers: mocks.members,
  useAdminMember: mocks.member,
  useRevokeAdminMember: () => ({ mutate: vi.fn(), isPending: false }),
  useRestoreAdminMember: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/impersonation/hooks/use-impersonation', () => ({
  useImpersonateMember: () => ({
    mutate: mocks.impersonate,
    isPending: false,
  }),
}));

vi.mock('@/features/admin-operations/hooks/use-admin-operations', () => ({
  useAdminPublicHall: mocks.hall,
  usePostPublicExam: () => ({ mutate: vi.fn(), isPending: false }),
  useUnpostPublicExam: () => ({ mutate: vi.fn(), isPending: false }),
  useAdminStudyRooms: mocks.rooms,
  useAdminConsultations: mocks.consultations,
  useUpdateAdminConsultation: () => ({ mutate: vi.fn(), isPending: false }),
  useAdminSummary: () => ({
    data: {
      totalMemberCount: 34,
      newMemberCount: 6,
      consultationCount: 5,
      averageFirstResponseMinutes: 252,
      activeStudyRoomCount: 6,
      challengeCount: 276,
      mostCommonConsultationCategory: '로그인·비밀번호 3건',
    },
  }),
}));

vi.mock('@/features/exam/hooks/use-exam-query', () => ({
  useAdminExamsQuery: () => ({ data: [] }),
  useAdminQuestionBankQuery: mocks.questionBank,
}));

vi.mock('@/features/exam/hooks/use-exam-mutation', () => ({
  useUpsertGradeCutoff: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/weakness-tree/hooks/use-tree', () => {
  // 관리자 문제은행은 admin 전용 트리 훅을 쓴다(옵션 A). 공용 훅도 유지.
  const treeStub = () => ({
    data: {
      groups: [
        {
          subject: 'ALGEBRA',
          nodes: [
            {
              nodeId: '10',
              displayName: '수열',
              depth: 1,
            },
          ],
        },
        {
          subject: 'COMMON_MATH_1',
          nodes: [
            {
              nodeId: '20',
              displayName: '공통수학 다항식',
              depth: 1,
            },
          ],
        },
      ],
    },
    isPending: false,
  });
  return {
    useAdminTreeQuery: treeStub,
    useMyTreeQuery: treeStub,
  };
});

vi.mock('@/shared/components/ui', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/components/ui')>();
  return {
    ...actual,
    SearchInput: ({
      value,
      onChange,
      onSearch,
      placeholder,
    }: {
      value: string;
      onChange: (value: string) => void;
      onSearch: (value: string) => void;
      placeholder: string;
    }) => (
      <input
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSearch(value);
        }}
      />
    ),
  };
});

const member = {
  memberId: 11,
  name: '박하윤',
  email: 'hayoon@example.com',
  role: 'STUDENT',
  signupPath: 'SELF',
  signupAt: '2026-08-02T10:00:00',
  studyRoomCount: 1,
  lastActiveAt: '2026-08-04T16:11:00',
  isQaAccount: false,
  revoked: false,
};

describe('MVP-G 관리자 4단계 프로토타입 상태', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('a-members ok와 tab2 문구를 표시한다', () => {
    mocks.members.mockReturnValue({
      data: { content: [member], totalElements: 1 },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminMemberList />);
    expect(screen.getByText('회원 관리')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '상세' })).toBeInTheDocument();
    expect(screen.getByText('최근 7일')).toBeVisible();
    expect(screen.getByRole('button', { name: '대신 보기' })).toBeVisible();
    fireEvent.click(screen.getByTestId('member-tab-teacher'));
    expect(screen.getByText(/학생 초대 결과를 확인합니다/)).toBeInTheDocument();
  });

  test('a-members-empty는 검색 후 선생님 탭과 교차 검색 2 CTA를 표시한다', async () => {
    mocks.members.mockReturnValue({
      data: { content: [], totalElements: 0 },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminMemberList />);
    const search = screen.getByLabelText('이름 또는 이메일로 검색');
    fireEvent.change(search, { target: { value: '박' } });
    fireEvent.keyDown(search, { key: 'Enter' });

    await waitFor(() =>
      expect(screen.getByTestId('member-tab-teacher')).toHaveClass(
        'text-orange-11'
      )
    );
    expect(screen.getByText('"박"으로 찾은 선생님이 없어요')).toBeVisible();
    expect(
      screen.getByRole('button', { name: '학생 탭에서 "박" 찾기' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: '검색어 지우고 전체 보기' })
    ).toBeVisible();
    expect(screen.queryByText('최근 7일')).not.toBeInTheDocument();
  });

  test('a-members-error는 토큰 기반 통합 경고와 최근 조치 이력을 표시한다', () => {
    mocks.members.mockReturnValue({
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });
    renderWithProviders(<AdminMemberList />);
    const warning = screen.getByTestId('admin-members-error');
    expect(warning).toHaveClass('border-system-warning');
    expect(warning).toHaveClass('bg-system-warning-alt');
    expect(
      screen.getByText('회원 목록을 불러오지 못했어요')
    ).toBeInTheDocument();
    expect(screen.getByText('최근 조치 이력')).toBeInTheDocument();
  });

  test('a-bank-empty는 과목 선택과 실제 업로드 CTA를 보존한다', async () => {
    mocks.questionBank.mockReturnValue({
      data: { content: [], totalElements: 0, page: 0, size: 20 },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<AdminQuestionBank />);

    expect(screen.getByText('이 단원에는 아직 문항이 없어요')).toBeVisible();
    expect(screen.queryByText('검수 대기 0개')).not.toBeInTheDocument();
    expect(screen.queryByText('등급 기준표 등록')).not.toBeInTheDocument();
    expect(screen.queryByText('일괄 올리기')).not.toBeInTheDocument();
    expect(
      screen.getByTestId('admin-question-bank-subject-filter')
    ).toBeVisible();
    expect(screen.getByTestId('admin-question-bank-unit-filter')).toBeVisible();
    expect(
      screen.getByTestId('admin-question-bank-grade-filter')
    ).toHaveTextContent('고2');
    fireEvent.click(screen.getByTestId('admin-question-bank-unit-filter'));
    expect(await screen.findByRole('option', { name: '수열' })).toBeVisible();
    expect(
      screen.queryByRole('option', { name: '공통수학 다항식' })
    ).toBeNull();
    fireEvent.click(screen.getByRole('option', { name: '수열' }));
    expect(
      screen.getByTestId('admin-question-bank-unit-filter')
    ).toHaveTextContent('수열');
    await waitFor(() =>
      expect(mocks.questionBank).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'HIGH_2', treeNodeIds: [10] })
      )
    );
    expect(
      screen.getByRole('link', { name: '이 단원 문항 올리기' })
    ).toHaveAttribute(
      'href',
      '/admin/open-challenge/new?grade=HIGH_2&treeNodeId=10'
    );
    fireEvent.click(screen.getByTestId('admin-question-bank-grade-filter'));
    fireEvent.click(await screen.findByRole('option', { name: '고1' }));
    await waitFor(() =>
      expect(mocks.questionBank).toHaveBeenCalledWith(
        expect.objectContaining({ grade: 'HIGH_1', treeNodeIds: [] })
      )
    );
    expect(
      screen.getByTestId('admin-question-bank-unit-filter')
    ).toHaveTextContent('전체');
    fireEvent.click(screen.getByTestId('admin-question-bank-unit-filter'));
    expect(
      await screen.findByRole('option', { name: '공통수학 다항식' })
    ).toBeVisible();
    expect(screen.queryByRole('option', { name: '수열' })).toBeNull();
    fireEvent.click(screen.getByRole('option', { name: '전체 단원' }));
    expect(
      screen.queryByTestId('admin-question-bank-review-filter')
    ).toBeNull();
    expect(screen.queryByText(/0개 · 검수 완료/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '이 단원 문항 올리기' })
    ).toHaveAttribute('href', '/admin/open-challenge/new?grade=HIGH_1');
    expect(screen.getByTestId('admin-question-bank-empty')).toHaveClass(
      'border-dashed',
      'bg-white'
    );
  });

  test('TC-API-002 문제은행 CTA의 고2·단원 맥락을 신규 문항 폼이 prefill한다', () => {
    renderWithProviders(
      <AdminOpenChallengeForm prefill={{ grade: 'HIGH_2', treeNodeId: 10 }} />
    );

    expect(screen.getByTestId('admin-question-bank-prefill')).toHaveTextContent(
      '고2 단원 10 맥락을 적용했습니다.'
    );
  });

  test('[BUG-QA-06 거절] 문제은행에 문항이 있으면 기존 운영 필터와 통계행을 보존한다', () => {
    mocks.questionBank.mockReturnValue({
      data: {
        content: [
          {
            challengeId: 4000,
            title: '등차수열 문항',
            questionText: '첫째항과 공차를 구하시오.',
            treeNodeId: 10,
            treeNodePath: '수학Ⅰ > 수열',
            sourceText: '6월 학력평가',
            difficulty: 'MID',
            wrongAnswerRate: 30,
            hasCorrectAnswer: true,
            questionImageUrl: null,
          },
        ],
        totalElements: 1,
        page: 0,
        size: 20,
      },
      isPending: false,
      isError: false,
    });

    renderWithProviders(<AdminQuestionBank />);

    expect(
      screen.getByTestId('admin-question-bank-subject-filter')
    ).toBeVisible();
    expect(
      screen.getByTestId('admin-question-bank-review-filter')
    ).toBeVisible();
    expect(screen.getByText(/1개 · 검수 완료 1 · 검수 대기 0/)).toBeVisible();
    expect(screen.queryByTestId('admin-question-bank-empty')).toBeNull();
  });

  test('a-member는 30분 제한 대리 보기 실행 버튼을 제공한다', () => {
    mocks.member.mockReturnValue({
      data: {
        ...member,
        role: 'TEACHER',
        signupPath: 'TEACHER_INVITE',
        revokedAt: null,
        studyRooms: [
          { studyRoomId: 3, name: '한지우 수학반', state: 'ACTIVE' },
        ],
        actionHistory: [],
      },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminMemberDetail memberId={11} />);
    expect(screen.getByText('계정')).toBeInTheDocument();
    expect(screen.getByText('조치 이력')).toBeInTheDocument();
    expect(screen.getByText('권한 회수')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '박하윤님 화면 대신 보기' })
    );
    expect(mocks.impersonate).toHaveBeenCalledWith({
      memberId: 11,
      name: '박하윤',
    });
  });

  test('a-hall ok와 empty를 각각 표시한다', () => {
    mocks.hall.mockReturnValue({
      data: {
        postings: [
          {
            postingId: 1,
            examId: 2,
            title: '6월 고2 학력평가 수학',
            questionCount: 30,
            audience: 'NO_STUDY_ROOM',
            openAt: '2026-08-01T00:00:00Z',
            closeAt: null,
            postedAt: '2026-08-01T00:00:00Z',
            attemptCount: 14,
            hasCutoff: true,
          },
        ],
        clones: [],
      },
      isPending: false,
      isError: false,
    });
    const view = renderWithProviders(<AdminPublicHall />);
    expect(screen.getAllByText('게시 중')).toHaveLength(2);
    expect(screen.getByText('선생님이 복제해 간 것')).toBeInTheDocument();
    view.unmount();
    mocks.hall.mockReturnValue({
      data: { postings: [], clones: [] },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminPublicHall />);
    expect(
      screen.getByText('지금 게시 중인 시험이 없어요')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '새로 게시' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '6월 학력평가로 게시하기' })
    ).toBeVisible();
  });

  test('a-rooms 관계 목록을 표시하고 학습 데이터 링크를 만들지 않는다', () => {
    mocks.rooms.mockReturnValue({
      data: {
        content: [
          {
            studyRoomId: 1,
            name: '김서준 1대1',
            teacherName: '조성진',
            studentName: '김서준',
            studentCount: 1,
            state: 'ACTIVE',
            startedAt: '2026-05-04T00:00:00',
            lastLessonAt: '2026-08-04T16:11:00',
          },
        ],
        totalElements: 1,
        stateCounts: { ACTIVE: 1, RECRUITING: 0, ENDED: 0 },
      },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminStudyRooms />);
    expect(screen.getByText('김서준 1대1')).toBeInTheDocument();
    expect(screen.getByText(/수업 내용을 열지 않습니다/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('a-consult ok와 empty를 각각 표시한다', () => {
    mocks.consultations.mockReturnValue({
      data: {
        content: [
          {
            caseId: 1,
            status: 'RECEIVED',
            title: '로그인이 안 됩니다',
            message: '비밀번호를 바꾼 뒤 로그인 화면에서 튕겨요',
            senderName: '박하윤',
            senderRole: 'STUDENT',
            senderContact: 'hayoon@example.com',
            receivedAt: '2026-08-04T15:41:00',
            assigneeName: null,
            answer: null,
            answeredAt: null,
            delayed: false,
          },
        ],
        totalElements: 1,
        statusCounts: { RECEIVED: 1, IN_PROGRESS: 2, ANSWERED: 2 },
        delayedCount: 1,
      },
      isPending: false,
      isError: false,
    });
    const view = renderWithProviders(<AdminConsultations />);
    expect(
      screen.getByText('답변 쓰기', { selector: 'h2' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '답변 보내고 완료 처리' })
    ).toBeInTheDocument();
    view.unmount();
    mocks.consultations.mockReturnValue({
      data: {
        content: [],
        totalElements: 0,
        statusCounts: {},
        delayedCount: 0,
      },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminConsultations />);
    expect(screen.getByText('받은 문의가 없어요')).toBeInTheDocument();
    expect(screen.getByText('평균 첫 응답')).toBeInTheDocument();
    expect(
      screen.queryByTestId('admin-consultations-chip-RECEIVED')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('admin-consultations-delayed-chip')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('이름, 내용으로 검색')
    ).not.toBeInTheDocument();
  });

  /*
   * 지연을 정렬에서 뺀 대신 지연 칩으로 모아 보게 했다(fix-report-v8-3 A).
   * 칩이 눌리면 실제로 조회 조건이 바뀌어야 한다. 눌러도 아무 일 없는 버튼을 막는 검사다.
   */
  test('지연 칩은 건수를 보여주고 누르면 지연만 보기 조건으로 다시 조회한다', () => {
    mocks.consultations.mockReturnValue({
      data: {
        content: [
          {
            caseId: 9,
            status: 'RECEIVED',
            title: '이틀째 답이 없어요',
            message: '지난주에 보낸 문의가 그대로입니다',
            senderName: '한지우',
            senderRole: 'TEACHER',
            senderContact: 'jiwoo@example.com',
            receivedAt: '2026-08-01T09:00:00',
            assigneeName: null,
            answer: null,
            answeredAt: null,
            delayed: true,
          },
        ],
        totalElements: 1,
        statusCounts: { RECEIVED: 4, IN_PROGRESS: 2, ANSWERED: 2 },
        delayedCount: 3,
      },
      isPending: false,
      isError: false,
    });
    renderWithProviders(<AdminConsultations />);

    const chip = screen.getByTestId('admin-consultations-delayed-chip');
    expect(chip).toHaveTextContent('지연');
    expect(chip).toHaveTextContent('3');
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    // 안 눌린 상태라도 남은 지연이 있으면 경고색으로 눈에 걸려야 한다.
    expect(chip.className).toContain('text-red-10');
    // 칩 문구가 좁은 폭에서 "지 / 연" 으로 쪼개지지 않는다.
    expect(chip.className).toContain('whitespace-nowrap');
    // 지연 건에는 표에도 표시가 붙는다.
    expect(
      screen.getByTestId('admin-consultation-delayed-badge')
    ).toBeInTheDocument();
    // 안내 문구가 구현과 맞아야 한다. 지연 우선 정렬은 이미 폐기됐다.
    const note = screen.getByTestId('admin-consultations-delay-note');
    expect(note).not.toHaveTextContent('맨 위로');
    expect(note).toHaveTextContent('접수 → 처리 중 → 답변 완료');

    const before = mocks.consultations.mock.calls.length;
    fireEvent.click(chip);

    expect(mocks.consultations.mock.calls.length).toBeGreaterThan(before);
    const lastParams = mocks.consultations.mock.calls.at(-1)?.[0];
    expect(lastParams).toMatchObject({ status: 'RECEIVED', delayedOnly: true });
    expect(
      screen.getByTestId('admin-consultations-delayed-chip')
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

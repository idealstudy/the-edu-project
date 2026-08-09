import { AdminMemberDetail } from '@/features/admin-member/components/admin-member-detail';
import { AdminMemberList } from '@/features/admin-member/components/admin-member-list';
import { AdminConsultations } from '@/features/admin-operations/components/admin-consultations';
import { AdminPublicHall } from '@/features/admin-operations/components/admin-public-hall';
import { AdminStudyRooms } from '@/features/admin-operations/components/admin-study-rooms';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  members: vi.fn(),
  member: vi.fn(),
  hall: vi.fn(),
  rooms: vi.fn(),
  consultations: vi.fn(),
}));

vi.mock('@/features/admin-member/hooks/use-admin-members', () => ({
  useAdminMembers: mocks.members,
  useAdminMember: mocks.member,
  useRevokeAdminMember: () => ({ mutate: vi.fn(), isPending: false }),
  useRestoreAdminMember: () => ({ mutate: vi.fn(), isPending: false }),
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
}));

vi.mock('@/shared/components/ui', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/components/ui')>();
  return {
    ...actual,
    SearchInput: ({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
    }) => (
      <input
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
    fireEvent.click(screen.getByTestId('member-tab-teacher'));
    expect(screen.getByText(/학생 초대 결과를 확인합니다/)).toBeInTheDocument();
  });

  test('a-members empty와 error를 각각 표시한다', () => {
    mocks.members.mockReturnValue({
      data: { content: [], totalElements: 0 },
      isPending: false,
      isError: false,
    });
    const view = renderWithProviders(<AdminMemberList />);
    expect(screen.getByText('등록된 학생이 없어요')).toBeInTheDocument();
    view.unmount();
    mocks.members.mockReturnValue({
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    });
    renderWithProviders(<AdminMemberList />);
    expect(
      screen.getByText('회원 목록을 불러오지 못했어요')
    ).toBeInTheDocument();
    expect(screen.getByText('최근 조치 이력')).toBeInTheDocument();
  });

  test('a-member는 대리 로그인 버튼 없이 계정, 조치 이력, 권한 회수를 표시한다', () => {
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
    expect(
      screen.queryByRole('button', { name: /이 사람 화면 보기/ })
    ).not.toBeInTheDocument();
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
    expect(chip.className).toContain('text-[#b91c1c]');
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

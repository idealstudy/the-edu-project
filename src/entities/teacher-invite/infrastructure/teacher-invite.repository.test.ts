import { teacherInviteRepository } from './teacher-invite.repository';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  publicGet: vi.fn(),
  publicPost: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    private: {
      get: mocks.get,
      patch: mocks.patch,
      post: vi.fn(),
      delete: vi.fn(),
    },
    public: { get: mocks.publicGet, post: mocks.publicPost },
  },
}));

describe('TC-INV-019 preference transport 계약', () => {
  beforeEach(() => vi.clearAllMocks());

  test('초기 표시 상태는 명시적인 preference 경로와 mode shape로 읽는다', async () => {
    mocks.get.mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: { mode: 'VISIBLE', hiddenUntil: null, hiddenForever: false },
    });

    await expect(teacherInviteRepository.state()).resolves.toEqual({
      mode: 'VISIBLE',
      hiddenUntil: null,
      hiddenForever: false,
    });
    expect(mocks.get).toHaveBeenCalledWith(
      '/student/teacher-invites/preference'
    );
  });

  test('유예는 preference 하위 PATCH에 요청 mode를 명시한다', async () => {
    mocks.patch.mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: {
        mode: 'SNOOZED',
        hiddenUntil: '2026-09-05T00:00:00',
        hiddenForever: false,
      },
    });

    await teacherInviteRepository.snooze('SEVEN_DAYS');

    expect(mocks.patch).toHaveBeenCalledWith(
      '/student/teacher-invites/snooze',
      { mode: 'SEVEN_DAYS' }
    );
  });
});

describe('TC-API-003 공개 초대 transport 계약', () => {
  beforeEach(() => vi.clearAllMocks());

  test('preview와 accept는 refresh interceptor 없는 api.public만 사용한다', async () => {
    mocks.publicGet.mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: { studentName: '김O생', valid: true },
    });
    mocks.publicPost.mockResolvedValue({
      status: 201,
      message: '성공입니다.',
      data: {
        teacherId: 1,
        studentId: 2,
        studyRoomId: 3,
        inviteStatus: 'ACCEPTED',
        acceptedAt: '2026-08-29T00:00:00',
      },
    });

    await teacherInviteRepository.preview('raw token');
    await teacherInviteRepository.accept('raw token', {
      mode: 'EXISTING_ACCOUNT',
    });

    expect(mocks.publicGet).toHaveBeenCalledWith(
      '/public/invites/raw%20token'
    );
    expect(mocks.publicPost).toHaveBeenCalledWith(
      '/public/invites/raw%20token/accept',
      { mode: 'EXISTING_ACCOUNT' }
    );
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.patch).not.toHaveBeenCalled();
  });
});

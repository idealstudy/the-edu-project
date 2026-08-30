import {
  trackTeacherInviteAcceptSuccess,
  trackTeacherInviteBannerImpression,
  trackTeacherInviteIssueSuccess,
  trackTeacherInviteSnooze,
} from '@/shared/lib/analytics/trackers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock('@/shared/lib/analytics/track', () => ({ track: mocks.track }));

describe('TC-AN-001 선생님 초대 analytics transport 계약', () => {
  beforeEach(() => mocks.track.mockClear());

  test('4개 성공 이벤트가 정본 event명과 property key만 transport에 전달된다', () => {
    trackTeacherInviteBannerImpression();
    trackTeacherInviteIssueSuccess('connections');
    trackTeacherInviteAcceptSuccess('SIGN_UP');
    trackTeacherInviteSnooze('THREE_DAYS');

    expect(mocks.track.mock.calls).toEqual([
      [
        'teacher_invite_impression',
        { surface: 'student_home', user_type: 'student' },
      ],
      [
        'teacher_invite_issue_success',
        { surface: 'connections', user_type: 'student' },
      ],
      [
        'teacher_invite_accept_success',
        { account_mode: 'SIGN_UP', user_type: 'teacher' },
      ],
      [
        'teacher_invite_snooze',
        { mode: 'THREE_DAYS', surface: 'student_home', user_type: 'student' },
      ],
    ]);
    const serialized = JSON.stringify(mocks.track.mock.calls);
    for (const forbidden of [
      'token',
      'inviteUrl',
      'email',
      'phoneNumber',
      'memberId',
      'studentId',
      'teacherId',
      'studyRoomId',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

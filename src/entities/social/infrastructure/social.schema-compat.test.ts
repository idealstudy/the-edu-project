import { describe, expect, test } from 'vitest';

import { domain } from '../core/social.domain';
import { dto } from './social.dto';

const legacyResult = {
  shareToken: 'legacy-token',
  status: 'COMPLETED' as const,
  challengeId: 42,
  outcome: 'WIN' as const,
  myCorrect: true,
  opponentCorrect: false,
  myAttempt: null,
  opponentAttempt: null,
  divergence: null,
  context: {
    inviterName: '기존 초대자',
    sentAt: null,
    opponentSolvedAt: null,
  },
};

const legacyFriendship = {
  id: 7,
  requesterId: 1,
  addresseeId: 2,
  state: 'ACCEPTED' as const,
  regDate: null,
  requesterName: '나',
  requesterProfileImageUrl: null,
  addresseeName: '친구',
  addresseeProfileImageUrl: null,
};

describe('social response schema compatibility', () => {
  test('신규 대결 결과 필드와 친구 활동 필드가 있는 응답을 유지한다', () => {
    const result = {
      ...legacyResult,
      opponentName: '친구',
      viewerRole: 'INVITER' as const,
      openDuelCount: 2,
      headToHead: { win: 3, lose: 1, draw: 1 },
    };
    const friendship = {
      ...legacyFriendship,
      myTurn: true,
      lastActivity: {
        occurredAt: '2026-08-13T21:40:00',
        type: 'OPPONENT_SUBMITTED' as const,
      },
    };

    expect(dto.challengeInviteResult.parse(result)).toMatchObject({
      opponentName: '친구',
      viewerRole: 'INVITER',
      openDuelCount: 2,
      headToHead: { win: 3, lose: 1, draw: 1 },
    });
    expect(domain.challengeInviteResult.parse(result)).toMatchObject({
      opponentName: '친구',
      viewerRole: 'INVITER',
      openDuelCount: 2,
      headToHead: { win: 3, lose: 1, draw: 1 },
    });
    expect(dto.friendship.parse(friendship)).toMatchObject({
      myTurn: true,
      lastActivity: { type: 'OPPONENT_SUBMITTED' },
    });
    expect(domain.friendship.parse(friendship)).toMatchObject({
      myTurn: true,
      lastActivity: { type: 'OPPONENT_SUBMITTED' },
    });
  });

  test('신규 필드가 전부 없는 이전 서버 응답도 DTO와 도메인 검증을 통과한다', () => {
    const parsedDtoResult = dto.challengeInviteResult.parse(legacyResult);
    const parsedDomainResult = domain.challengeInviteResult.parse(legacyResult);
    const parsedDtoFriendship = dto.friendship.parse(legacyFriendship);
    const parsedDomainFriendship = domain.friendship.parse(legacyFriendship);

    expect(parsedDtoResult.opponentName).toBeUndefined();
    expect(parsedDomainResult.headToHead).toBeUndefined();
    expect(parsedDtoFriendship.myTurn).toBeUndefined();
    expect(parsedDomainFriendship.lastActivity).toBeUndefined();
  });

  test('서버가 미등록 활동 코드를 추가해도 친구 응답 자체는 유지한다', () => {
    const friendshipWithUnknownActivity = {
      ...legacyFriendship,
      lastActivity: {
        occurredAt: '2026-08-13T21:40:00',
        type: 'FUTURE_ACTIVITY',
      },
    };

    expect(
      dto.friendship.parse(friendshipWithUnknownActivity).lastActivity?.type
    ).toBe('FUTURE_ACTIVITY');
    expect(
      domain.friendship.parse(friendshipWithUnknownActivity).lastActivity?.type
    ).toBe('FUTURE_ACTIVITY');
  });
});

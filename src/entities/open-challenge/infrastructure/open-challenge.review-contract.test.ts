import { describe, expect, it } from 'vitest';

import { dto } from './open-challenge.dto';

const baseReview = {
  reviewId: 11,
  nickname: '학생',
  content: '풀이',
  recommendCount: 3,
};

describe('오픈챌린지 공개 풀이 응답 계약', () => {
  it('정본 boolean 필드 이름을 파싱한다', () => {
    const review = dto.review.parse({
      ...baseReview,
      isBest: true,
      isRecommendedByMe: false,
      isMine: true,
    });

    expect(review).toMatchObject({
      isBest: true,
      isRecommendedByMe: false,
      isMine: true,
    });
  });

  it('레거시 별칭만 있는 응답은 계약 위반으로 거부한다', () => {
    const result = dto.review.safeParse({
      ...baseReview,
      best: true,
      recommendedByMe: false,
      mine: true,
    });

    expect(result.success).toBe(false);
  });
});

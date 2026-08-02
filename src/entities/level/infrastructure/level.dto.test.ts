import { describe, expect, test } from 'vitest';

import { dto } from './level.dto';

describe('badge dto — icon 필드', () => {
  test('icon이 null이어도 파싱에 성공하고 빈 문자열로 대체된다 (시드 NULL 폴백)', () => {
    const parsed = dto.badge.parse({
      id: 1,
      code: 'FIRST_CORRECT',
      name: '첫 정답',
      description: '첫 정답을 맞혔어요',
      conditionType: 'FIRST_CORRECT',
      threshold: null,
      icon: null,
      earned: false,
      earnedAt: null,
    });

    expect(parsed.icon).toBe('');
  });

  test('icon이 정상 문자열이면 그대로 유지한다', () => {
    const parsed = dto.badge.parse({
      id: 1,
      code: 'FIRST_CORRECT',
      name: '첫 정답',
      description: '첫 정답을 맞혔어요',
      conditionType: 'FIRST_CORRECT',
      threshold: null,
      icon: 'https://cdn.example.com/badge.png',
      earned: false,
      earnedAt: null,
    });

    expect(parsed.icon).toBe('https://cdn.example.com/badge.png');
  });

  test('icon 필드가 아예 없어도 빈 문자열 기본값으로 파싱된다', () => {
    const parsed = dto.badge.parse({});

    expect(parsed.icon).toBe('');
  });
});

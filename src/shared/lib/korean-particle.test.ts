import { describe, expect, test } from 'vitest';

import { withKoreanParticle } from './korean-particle';

describe('withKoreanParticle', () => {
  test.each([
    ['민준', '을/를', '민준을'],
    ['민서', '을/를', '민서를'],
    ['민준', '이/가', '민준이'],
    ['민서', '이/가', '민서가'],
    ['민준', '은/는', '민준은'],
    ['민서', '은/는', '민서는'],
    ['민준', '와/과', '민준과'],
    ['민서', '와/과', '민서와'],
    ['민준', '아/야', '민준아'],
    ['민서', '아/야', '민서야'],
    ['민준', '이랑/랑', '민준이랑'],
    ['민서', '이랑/랑', '민서랑'],
    ['집', '으로/로', '집으로'],
    ['학교', '으로/로', '학교로'],
    ['서울', '으로/로', '서울로'],
  ] as const)(
    '한글 이름 %s 뒤에서 %s 중 맞는 조사를 고른다',
    (word, pair, expected) => {
      expect(withKoreanParticle(word, pair)).toBe(expected);
    }
  );

  test.each([
    ['E2E학생0', 'E2E학생0과'],
    ['E2E학생1', 'E2E학생1과'],
    ['E2E학생2', 'E2E학생2와'],
    ['E2E학생3', 'E2E학생3과'],
    ['E2E학생4', 'E2E학생4와'],
    ['E2E학생5', 'E2E학생5와'],
    ['E2E학생6', 'E2E학생6과'],
    ['E2E학생7', 'E2E학생7과'],
    ['E2E학생8', 'E2E학생8과'],
    ['E2E학생9', 'E2E학생9와'],
  ])('숫자 끝소리로 %s의 와/과를 고른다', (word, expected) => {
    expect(withKoreanParticle(word, '와/과')).toBe(expected);
  });

  test.each([
    ['A', '와'],
    ['B', '와'],
    ['C', '와'],
    ['D', '와'],
    ['E', '와'],
    ['F', '과'],
    ['G', '와'],
    ['H', '과'],
    ['I', '와'],
    ['J', '와'],
    ['K', '와'],
    ['L', '과'],
    ['M', '과'],
    ['N', '과'],
    ['O', '와'],
    ['P', '와'],
    ['Q', '와'],
    ['R', '과'],
    ['S', '과'],
    ['T', '와'],
    ['U', '와'],
    ['V', '와'],
    ['W', '와'],
    ['X', '과'],
    ['Y', '와'],
    ['Z', '와'],
  ])('영문 %s의 알파벳 읽는 소리로 와/과를 고른다', (letter, particle) => {
    expect(withKoreanParticle(`학생${letter}`, '와/과')).toBe(
      `학생${letter}${particle}`
    );
  });

  test('숫자와 영문의 ㄹ 끝소리는 으로/로 예외를 적용한다', () => {
    expect(withKoreanParticle('학생1', '으로/로')).toBe('학생1로');
    expect(withKoreanParticle('학생L', '으로/로')).toBe('학생L로');
    expect(withKoreanParticle('학생0', '으로/로')).toBe('학생0으로');
    expect(withKoreanParticle('학생X', '으로/로')).toBe('학생X으로');
  });

  test('판정할 수 없는 끝 글자는 받침 없음으로 본다', () => {
    expect(withKoreanParticle('학생🙂', '은/는')).toBe('학생🙂는');
  });
});

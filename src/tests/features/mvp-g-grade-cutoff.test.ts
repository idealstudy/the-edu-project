import { GradeCutoffFormSchema } from '@/features/admin-question-bank/schema/schema';
import { describe, expect, test } from 'vitest';

const validForm = {
  examId: 91,
  source: 'EBSi 2027 6월 모의평가',
  fullScore: 100,
  mean: 52.3,
  stdDev: 19.7,
  grade1: 92,
  grade2: 84,
  grade3: 76,
  grade4: 68,
  grade5: 60,
  grade6: 52,
  grade7: 44,
  grade8: 36,
};

describe('MVP-G 등급 기준표', () => {
  test('1등급부터 8등급까지 내림차순이면 입력을 받는다', () => {
    expect(GradeCutoffFormSchema.safeParse(validForm).success).toBe(true);
  });

  test('6등급 하한이 5등급보다 높으면 사람이 읽을 수 있는 오류를 낸다', () => {
    const result = GradeCutoffFormSchema.safeParse({
      ...validForm,
      grade6: 61,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('1등급부터 8등급까지');
    }
  });
});

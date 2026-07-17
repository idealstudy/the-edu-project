import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * /consult 폼 스키마 — 엔티티 계층 dto(consultation-lead.dto.ts)의
 * 요청 payload 스키마와 별개로 둔다. 폼은 utm/source를 사용자가
 * 입력하지 않고 페이지 진입 시 자동 캡처하므로, react-hook-form이
 * 다루는 필드만 여기서 정의한다 (api-contract §4.2, frd §4.5.2).
 * ────────────────────────────────────────────────────*/
export const ConsultFormSchema = z
  .object({
    role: z.enum(['STUDENT', 'PARENT'], {
      message: '학생인지 학부모인지 선택해주세요.',
    }),
    name: z.string().max(30, '30자 이내로 입력해주세요.').optional(),
    contact: z
      .string()
      .min(1, '연락처를 입력해주세요.')
      .max(100)
      .refine(
        (v) =>
          /^01[016-9]-?\d{3,4}-?\d{4}$/.test(v) ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        '휴대폰 번호 또는 이메일 형식으로 입력해주세요.'
      ),
    birthYear: z
      .number({ message: '태어난 해를 입력해주세요.' })
      .int()
      .min(1950, '올바른 연도를 입력해주세요.')
      .max(new Date().getFullYear(), '올바른 연도를 입력해주세요.'),
    message: z
      .string()
      .min(10, '고민을 10자 이상 적어주세요.')
      .max(1000, '1000자 이내로 적어주세요.'),
    consentPrivacy: z.literal(true, {
      message: '개인정보 수집·이용에 동의해야 접수할 수 있어요.',
    }),
    consentPublish: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      const isMinor = new Date().getFullYear() - data.birthYear < 14;
      return !(isMinor && data.role === 'STUDENT');
    },
    {
      message:
        '만 14세 미만은 보호자가 대신 접수해주세요. 위에서 "학부모"를 선택해주세요.',
      path: ['role'],
    }
  );

export type ConsultForm = z.infer<typeof ConsultFormSchema>;

export const CONSENT_VERSION = 'v1';

/** 입력한 출생연도 기준 만 14세 미만 여부 (frd §4.5.3) */
export const isMinorByBirthYear = (birthYear: number | undefined) => {
  if (!birthYear || Number.isNaN(birthYear)) return false;
  return new Date().getFullYear() - birthYear < 14;
};

import { z } from 'zod';

export const CreateStudyRoomSchema = z.object({
  basic: z.object({
    title: z.string().min(1, '스터디룸 이름을 입력해주세요.'),
    // description: z.string().optional(),
    visibility: z.string().min(1, '공개 범위를 선택해주세요.'),
  }),
  profile: z
    .object({
      location: z.enum(['online', 'offline'], {
        required_error: '수업 장소를 선택해주세요.',
      }),
      classType: z.enum(['one_to_one', 'one_to_many'], {
        required_error: '수업 대상을 선택해주세요.',
      }),
      subject: z.enum(['ko', 'en', 'math', 'etc'], {
        required_error: '과목을 선택해주세요.',
      }),
      school: z.enum(['high', 'middle', 'elementary'], {
        required_error: '학교를 선택해주세요.',
      }),
      grade: z.string().min(1, '학년을 선택해주세요.'),
    })
    .refine(
      ({ school, grade }) => {
        const g = Number(grade);
        if (school === 'elementary') return g >= 1 && g <= 6;
        return g >= 1 && g <= 3;
      },
      { message: '학년 범위가 올바르지 않습니다.', path: ['grade'] }
    ),
  invite: z.object({
    emails: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().email('올바른 이메일을 입력해주세요.').optional()
    ),
  }),
});

export type StudyRoomFormValues = z.infer<typeof CreateStudyRoomSchema>;

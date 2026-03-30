import { z } from 'zod';

// 문의 등록
export const ConsultationFormSchema = z.object({
  teacherId: z.number({ required_error: '선생님을 선택해주세요.' }),
  studyRoomId: z.number().optional(),
  title: z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
});

export type ConsultationForm = z.infer<typeof ConsultationFormSchema>;

// 답변 등록
export const ConsultationAnswerFormSchema = z.object({
  content: z.string().min(1, '답변을 입력해주세요.'),
});

export type ConsultationAnswerForm = z.infer<
  typeof ConsultationAnswerFormSchema
>;

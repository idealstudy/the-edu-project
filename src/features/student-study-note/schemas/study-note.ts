import { JSONContent } from '@tiptap/react';
import { z } from 'zod';

export const SUBJECTS = [
  '국어',
  '수학',
  '영어',
  '과학',
  '사회',
  '예체능',
  '논술',
] as const;

export const studentStudyNoteSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해 주세요.')
    .max(50, '제목은 50자 이하로 입력해주세요.'),
  studiedAt: z.string().min(1, '학습 날짜를 선택해 주세요.'),
  subject: z.string().min(1, '과목을 선택해 주세요.'),
  content: z.custom<JSONContent>(),
});

export type StudentStudyNoteForm = z.infer<typeof studentStudyNoteSchema>;

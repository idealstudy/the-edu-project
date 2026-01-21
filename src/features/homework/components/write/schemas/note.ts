import { CourseTargetStudentInfo } from '@/features/dashboard/studynote/write/type';
import { JSONContent } from '@tiptap/react';
import { z } from 'zod';

const extractTextFromTiptapJSON = (doc: JSONContent): string => {
  if (!doc || !doc.content) return '';

  let text = '';

  const traverse = (nodes: JSONContent[]) => {
    nodes.forEach((node) => {
      if (node.type === 'text' && node.text) {
        text += node.text;
      } else if (node.content) {
        traverse(node.content);
      }
    });
  };

  traverse(doc.content);
  return text;
};

// 마감일 컨트롤

const deadlineSchema = z
  .string()
  .min(1, '날짜를 선택해 주세요.')
  .refine((value) => {
    const now = new Date();
    const deadlineDate = new Date(value);

    return deadlineDate >= now;
  }, '마감일은 현재 시점 이후여야 합니다.');

export const contentSchema = z
  .custom<JSONContent>((val) => typeof val === 'object' && val !== null)
  .superRefine((val, ctx) => {
    const plainText = extractTextFromTiptapJSON(val);
    const length = plainText.trim().length;

    if (length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '내용은 최소 10자 이상이어야 합니다.',
      });
    }

    if (length > 3000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '3000자 이상은 입력하실 수 없습니다.',
      });
    }
  });

export const HomeworkFormSchema = z.object({
  title: z
    .string()
    .min(1, '과제 제목을 입력해 주세요.')
    .max(30, '과제 제목은 30자 이하로 입력해주세요.'),
  content: contentSchema,
  deadline: deadlineSchema,
  studentIds: z
    .array(z.custom<CourseTargetStudentInfo>())
    .min(1, '제출 대상을 최소 1명 이상 선택해 주세요.'),
  reminderOffsets: z
    .array(z.enum(['HOUR_1', 'HOUR_3', 'DAY_1']))
    .nullable()
    .optional(),
  teachingNoteIds: z.array(z.number()).optional(),
  studyRoomId: z.number(),
});

export type HomeworkForm = z.infer<typeof HomeworkFormSchema>;

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

export const QnaACreateFormSchema = z.object({
  title: z
    .string()
    .min(1, '질문 제목을 작성해 주세요!')
    .max(50, '질문 제목은 30자 이하로 입력해주세요.'),
  studyRoomId: z.number({ required_error: '스터디룸을 선택해 주세요!' }),
  content: z.custom<JSONContent>().superRefine((val, ctx) => {
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
  }),
  // isGuardianVisible: z.boolean().optional(),
});

export type QnACreateForm = z.infer<typeof QnaACreateFormSchema>;

import { z } from 'zod';

const StudyNoteGroupItemDto = z.object({
  id: z.number().int(),
  title: z.string(),
});

const StudyNoteGroupPageDto = z.object({
  pageNumber: z.number().int(),
  size: z.number().int(),
  totalElements: z.number().int(),
  totalPages: z.number().int(),
  content: z.array(StudyNoteGroupItemDto),
});

export const dto = {
  item: StudyNoteGroupItemDto,
  page: StudyNoteGroupPageDto,
};

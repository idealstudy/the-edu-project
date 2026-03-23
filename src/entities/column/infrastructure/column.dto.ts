import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 칼럼 목록 조회 DTO (공개, APPROVED만)
 * ────────────────────────────────────────────────────*/
const ColumnListItemDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  authorNickname: z.string(),
  tags: z.array(z.string()),
  thumbnailUrl: z.string().nullable(),
  viewCount: z.number(),
  regDate: z.string(),
});

const ColumnPageDtoSchema = z.object({
  pageNumber: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
  content: z.array(ColumnListItemDtoSchema),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  listItem: ColumnListItemDtoSchema,
  page: ColumnPageDtoSchema,
};

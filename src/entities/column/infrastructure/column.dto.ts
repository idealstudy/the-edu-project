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
 * 칼럼 생성 Payload (선생님/관리자, PENDING_APPROVAL 상태로 저장)
 * POST
 * ────────────────────────────────────────────────────*/
const CreateColumnArticlePayloadSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  thumbnailMediaId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mediaIds: z.array(z.string()).optional(),
});

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const dto = {
  listItem: ColumnListItemDtoSchema,
  page: ColumnPageDtoSchema,
};

export const payload = {
  create: CreateColumnArticlePayloadSchema,
};

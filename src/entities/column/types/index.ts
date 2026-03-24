import { dto, payload } from '@/entities/column/infrastructure/column.dto';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Sort Type
 * ────────────────────────────────────────────────────*/
export type ColumnSortOption = 'LATEST' | 'POPULAR';

/* ─────────────────────────────────────────────────────
 * Frontend Type
 * ────────────────────────────────────────────────────*/
export type ColumnListItem = z.infer<typeof dto.listItem>;
export type ColumnPage = z.infer<typeof dto.page>;

/* ─────────────────────────────────────────────────────
 * Payload
 * ────────────────────────────────────────────────────*/
export type CreateColumnArticlePayload = z.infer<typeof payload.create>;

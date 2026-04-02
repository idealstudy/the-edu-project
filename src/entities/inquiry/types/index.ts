import { dto, payload } from '@/entities/inquiry/infrastructure/inquiry.dto';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Status Type
 * ────────────────────────────────────────────────────*/
export type InquiryStatus = 'PENDING' | 'ANSWERED';

/* ─────────────────────────────────────────────────────
 * Frontend Type
 * ────────────────────────────────────────────────────*/
export type InquiryDetail = z.infer<typeof dto.detail>;
export type InquiryListItem = z.infer<typeof dto.listItem>;
export type InquiryList = z.infer<typeof dto.list>;

/* ─────────────────────────────────────────────────────
 * Payload
 * ────────────────────────────────────────────────────*/
export type InquiryPayload = z.infer<typeof payload.create>;
export type InquiryAnswerPayload = z.infer<typeof payload.createAnswer>;

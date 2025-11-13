import { z } from 'zod';

import { domain } from '../core';
import { dto } from '../infrastructure';

/* ─────────────────────────────────────────────────────
 * DTO
 * ────────────────────────────────────────────────────*/
export type StudyNoteGroupDto = z.infer<typeof dto.item>;
export type StudyNoteGroupPageDto = z.infer<typeof dto.page>;

/* ─────────────────────────────────────────────────────
 * 도메인
 * ────────────────────────────────────────────────────*/
export type StudyNoteGroup = z.infer<typeof domain.group>;

import { domain } from '@/entities/parent-report/core';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * Domain 추론 Type
 * ────────────────────────────────────────────────────*/
export type Child = z.infer<typeof domain.child>;
export type ChildReport = z.infer<typeof domain.report>;

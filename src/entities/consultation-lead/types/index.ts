import { z } from 'zod';

import { dto } from '../infrastructure/consultation-lead.dto';

export type ConsultationLeadPayload = z.infer<typeof dto.leadPayload>;
export type ConsultationLeadResult = z.infer<typeof dto.leadResponse>;
export type ConsultationCaseListItem = z.infer<typeof dto.caseListItem>;
export type ConsultationCaseList = z.infer<typeof dto.caseList>;
export type ConsultationCaseDetail = z.infer<typeof dto.caseDetail>;

import { api } from '@/shared/api';
import { z } from 'zod';

const response = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ status: z.number(), message: z.string(), data: schema });

const issueData = z.object({
  inviteUrl: z.string().url(),
  expiresAt: z.string(),
});

const previewData = z.object({
  studentName: z.string(),
  valid: z.literal(true),
});

const acceptData = z.object({
  teacherId: z.number(),
  studentId: z.number(),
  studyRoomId: z.number(),
  inviteStatus: z.literal('ACCEPTED'),
  acceptedAt: z.string(),
});

const stateData = z.object({
  mode: z.enum(['VISIBLE', 'SNOOZED', 'HIDDEN_FOREVER', 'CONNECTED']),
  hiddenUntil: z.string().nullable(),
  hiddenForever: z.boolean(),
});

export type TeacherInviteIssue = z.infer<typeof issueData>;
export type TeacherInvitePreview = z.infer<typeof previewData>;
export type TeacherInviteAccept = z.infer<typeof acceptData>;
export type TeacherInviteState = z.infer<typeof stateData>;
export type TeacherInviteAcceptInput =
  | { mode: 'EXISTING_ACCOUNT' }
  | {
      mode: 'SIGN_UP';
      email: string;
      password: string;
      name: string;
      phoneNumber: string;
      agreeServiceTerms: boolean;
      agreePrivacyTerms: boolean;
      agreeAgeCheck: boolean;
      agreeMarketing: boolean;
    };

export const teacherInviteRepository = {
  state: async () => {
    const result = await api.private.get('/student/teacher-invites/preference');
    return response(stateData).parse(result).data;
  },
  issue: async () => {
    const result = await api.private.post('/student/teacher-invites');
    return response(issueData).parse(result).data;
  },
  revoke: async () => {
    await api.private.delete('/student/teacher-invites/active');
  },
  snooze: async (mode: 'THREE_DAYS' | 'SEVEN_DAYS' | 'FOREVER' | 'RESET') => {
    const result = await api.private.patch('/student/teacher-invites/snooze', {
      mode,
    });
    return response(stateData).parse(result).data;
  },
  preview: async (token: string) => {
    const result = await api.public.get(
      `/public/invites/${encodeURIComponent(token)}`
    );
    return response(previewData).parse(result).data;
  },
  accept: async (token: string, input: TeacherInviteAcceptInput) => {
    const result = await api.public.post(
      `/public/invites/${encodeURIComponent(token)}/accept`,
      input
    );
    return response(acceptData).parse(result).data;
  },
};

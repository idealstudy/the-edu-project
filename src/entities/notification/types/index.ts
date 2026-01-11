import { domain } from '@/entities/notification/core';
import { dto } from '@/entities/notification/infrastructure';
import { z } from 'zod';

export type NotificationDTO = z.infer<typeof dto.schema>;
export type NotificationCategory = z.infer<typeof dto.category>;

export type FrontendNotification = z.infer<typeof domain.schema>;

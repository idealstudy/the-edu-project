import { notificationMapper } from '@/entities/notification/mapper';
import {
  FrontendNotification,
  NotificationDTO,
} from '@/entities/notification/types';
import { api } from '@/shared/api';
import { CommonResponse } from '@/types';
import axios from 'axios';

import { adapters } from './notification.adapters';

/* ─────────────────────────────────────────────────────
 * [Read] 알림 목록 조회
 * useNotificationQuery의 queryFn으로 사용
 * ────────────────────────────────────────────────────*/
const getNotificationList = async (): Promise<FrontendNotification[]> => {
  try {
    const response = await api.bff.client.get<
      CommonResponse<NotificationDTO[]>
    >('/api/v1/notification');

    const validatedResponse = adapters.fromApi.parse(response);

    return notificationMapper.toDomianList(validatedResponse.data ?? []);
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) throw error;
    if (!error.response) throw error;

    const status = error.response.status;
    if (status === 401 || status === 403) return [];

    throw error;
  }
};

/* ─────────────────────────────────────────────────────
 * [Update] 알림 읽음 처리
 * useMutation의 mutationFn으로 처리
 * ────────────────────────────────────────────────────*/
// TODO 1. 알림 읽음 2. 미확인 알림

export const repository = {
  notification: {
    getList: getNotificationList,
    // TODO 추가
  },
};

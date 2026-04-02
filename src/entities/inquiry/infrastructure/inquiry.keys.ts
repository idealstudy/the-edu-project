import { InquiryStatus } from '@/entities/inquiry/types';

export const inquiryKeys = {
  all: ['inquiry'] as const,
  detail: (id: number) => [...inquiryKeys.all, 'detail', id] as const,
  myList: (params: { page: number; size: number }) =>
    [...inquiryKeys.all, 'myList', params] as const,
  receivedList: (params: {
    page: number;
    size: number;
    status?: InquiryStatus;
  }) => [...inquiryKeys.all, 'receivedList', params] as const,
};

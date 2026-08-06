export const memberKeys = {
  all: ['member'] as const,
  info: () => [...memberKeys.all, 'info'] as const,
  adminLists: () => [...memberKeys.all, 'admin-lists'] as const,
  adminDetails: () => [...memberKeys.all, 'admin-details'] as const,
  adminDetail: (memberId: number) =>
    [...memberKeys.adminDetails(), memberId] as const,
  adminList: (params: {
    role: 'STUDENT' | 'TEACHER' | 'PARENT';
    keyword?: string;
    includeQaAccount: boolean;
    page: number;
    size: number;
  }) => [...memberKeys.adminLists(), params] as const,
};

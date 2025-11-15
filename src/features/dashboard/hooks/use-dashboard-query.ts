import type { Dashboard } from '@/features/dashboard';
import { options } from '@/features/dashboard/api';
import type { BaseQueryOptions } from '@/shared/lib/query/types';
import { useQuery } from '@tanstack/react-query';

export const useDashboardQuery = (base: BaseQueryOptions = {}) => {
  const dashboardData = options.getDashboard(base);
  return useQuery<Dashboard>(dashboardData);
};

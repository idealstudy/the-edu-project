import { api } from '@/shared/api/http';

import type { Dashboard } from '../types';

type DashboardApiResponse = {
  data: Dashboard;
};

const getDashboard = async (): Promise<Dashboard> => {
  const response =
    await api.bff.client.get<DashboardApiResponse>('/api/v1/dashboard');
  return response.data;
};

export const dashboardApi = {
  getDashboard,
};

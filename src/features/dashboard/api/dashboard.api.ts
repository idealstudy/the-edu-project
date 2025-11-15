import { api } from '@/shared/api/http';

const getDashboard = async () => {
  return api.bff.client.get('/api/v1/dashboard');
};

export const dashboardApi = {
  getDashboard,
};
